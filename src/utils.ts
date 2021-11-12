import { Service, parse } from 'protobufjs';
import { MD5 } from 'object-hash';
import { List, Map, Set } from 'immutable';
import  { v4 as uuid } from 'uuid';
import { dump } from 'js-yaml';
import JSZip from 'jszip';
import equal from 'fast-deep-equal';
import {
  AccessPoint,
  HasAccessPointId,
  HasNodeId,
  Model,
  Node,
  RemoteMethod,
  State,
  UUID
} from './types';
// TODO perhaps move this type into types.ts to avoid a circular dependency?

/**
 * Convert literal ProtoBuf code into a list of RemoteMethod's
 */
export function protobufToRemoteMethods(code: string): Set<RemoteMethod> | null {
  try {
    // Parse out the root object from the ProtoBuf code
    const { root } = parse(code);
    // this is a bit of a hack to get only the services.
    // We start with all the contained objects (nestedArray)
    // Then we filter out only the ones whose JSON representations have a `methods` field
    // Finally, we cast to `Service` objects
    const services = root
      .nestedArray
      .filter(reflectionObject => reflectionObject.toJSON().methods)
      .map(obj => obj as Service);

    return Set(services.flatMap(service => service
      .methodsArray
      .map(method => ({
        name: method.name,
        requestType: {
          ...root.lookupType(method.requestType).toJSON(),
          name: method.requestType,
          streamed: method.requestStream || false
        },
        responseType: {
          ...root.lookupType(method.responseType).toJSON(),
          name: method.responseType,
          streamed: method.responseStream || false
        },
        remoteMethodId: uuid()
      })))
    );
  } catch (e: any) {
    // I really hate exceptions, so we just return null here. TODO make this more sophisticated
    return null;
  }
}

/**
 * Convert a Remote Method to a human-readable string
 */
export function remoteMethodToString({ name, requestType, responseType }: RemoteMethod): string {
  return `${name}(${requestType.name}): ${responseType.name}`;
}

/**
 * Keeps track of how many of each model have been instantiated
 */
let idCounter: Map<UUID, number> = Map();
/**
 * Given a model, instantiate it so that it can be used in the simulation
 */
export function instantiateModel(
  { modelId, methods }: Model, name: string
): Node {
  const nodeId = uuid();
  const accessPoints = methods.reduce<List<AccessPoint>>((acc, { name, requestType, responseType, remoteMethodId}) => {
    const requesterId = uuid();
    const responderId = uuid();
    return acc
      .push({
        kind:         'AccessPoint',
        role:         'Requester',
        name:          name,
        type:          requestType,
        accessPointId: requesterId,
        remoteMethodId,
        nodeId,
        x: 0,
        y: 0
      })
      .push({
        kind:         'AccessPoint',
        role:         'Responder',
        name:          name,
        type:          responseType,
        accessPointId: responderId,
        nodeId,
        remoteMethodId,
        x: 0,
        y: 0
      });
  }, List());

  // Get the number for this node
  const nodeNumber = (idCounter.get(modelId) || 1);
  // Increment the number for the modelId
  idCounter = idCounter.set(modelId,
    nodeNumber + 1
  );

  return {
    kind: 'Node',
    name: `${name} ${nodeNumber}`,
    nodeId,
    modelId,
    accessPoints,
    x: 0,
    y: 0
  };
}

/**
 * Can two methods be connected?
 */
export function compatibleMethods(left: AccessPoint, right: AccessPoint): boolean {
  const kinds = [left.role, right.role];
  return kinds.includes('Requester') &&
    kinds.includes('Responder') &&
    equal(left.type, right.type);
}

/**
 * Given an object, return a color value for it
 */
export function objectToColor(obj: any): string {
  return `#${MD5(obj).slice(0,6)}`;
}

export function ellipsePolarToCartesian(
  theta: number,
  rx: number,
  ry: number,
  cx = 0,
  cy = 0
): [number, number] {
  const { sin, cos } = Math;
  return [
    rx * cos(theta) + cx,
    ry * sin(theta) + cy
  ];
}

/**
 * A function that takes a react ref to a file input tag and outputs the plain-text value of the
 * currently-uploaded file
 */
export async function fileContent(element: HTMLInputElement): Promise<string | null> {
  // Get the set of files associated with the current file input
  // Note that we coerce to undefined in case of a falsy value here because the `Set`
  // constructor does not accept null.
  const files = List(element?.files || undefined);
  // We should make sure that the list has exactly one file
  if (files.size === 1) {
    // We can assert-nonnull here because we know the files list has a first element
    const file = files.first()!;
    return file.text();
  } else {
    console.error(`Didn't find exactly one protobuf file for the model. Files were [${files.map(file => file.name).join(', ')}]}`);
    return null;
  }
}

export function serializeState(state: State): string {
  return JSON.stringify(state);
}

export function deserializeState(serialized: string): State {
  const parsed = JSON.parse(serialized, (key, value) => {
    if (
      key === 'accessPoints' ||
      key === 'actions'
    ) {
      return List(value);
    } else if (
      key === 'methods' ||
      key === 'models' ||
      key === 'nodes' ||
      key === 'edges'
    ) {
      return Set(value);
    } else {
      return value;
    }
  });
  return parsed;
}

export function lookupAccessPoint(
  nodes: Set<Node>,
  { nodeId, accessPointId }: HasNodeId & HasAccessPointId): AccessPoint | null {
  return nodes
    .find(node => node.nodeId === nodeId)
    ?.accessPoints
    .find(ap => ap.accessPointId === accessPointId) || null;
}

export async function exportState({ models, nodes, edges }: State): Promise<Blob> {
  const zip = new JSZip();

  // This object represents the docker-compose file
  // We don't have a schema for this yet, so we effectively disable type-checking by giving it the
  // `any` type
  const dockerCompose: any = {
    version: '3',
    services: {
      'orchestrator-node': {
        image: 'sipgisr/grpc-orchestrator:latest',
        volumes: [{
          type: 'bind',
          source: './config.yml',
          target: '/app/config/config.yml'
        }],
        environment: {
          CONFIG_FILE: 'config/config.yml'
        }
      }
    }
  };

  models.forEach(({ name, image }) => {
    if (!(name in dockerCompose.services)) {
      dockerCompose.services[name] = {
        image
      };
    }
  });

  // This object represents the `config.yml` file
  const config: any = {
    stages: nodes.map(({ name, modelId }) => ({
      name,
      host: models.find(model => model.modelId === modelId)?.name || 'Model not found',
      port: 8061
    })).toArray(),
    links: edges.map(({ requesterId, responderId }) => ({
      source: {
        stage: nodes.find(({ nodeId }) => nodeId === responderId.nodeId)?.name || 'Node not found',
        field: lookupAccessPoint(nodes, responderId)?.name || 'Method not found'
      },
      target: {
        stage: nodes.find(({ nodeId }) => nodeId === requesterId.nodeId)?.name || 'Node not found',
        field: lookupAccessPoint(nodes, requesterId)?.name || 'Method not found'
      }
    })).toArray()
  };

  // Add the data to the zip as yaml
  zip.file('docker-compose.yml', dump(dockerCompose));
  zip.file('config.yml',         dump(config));

  // Generate a blob and return
  return zip.generateAsync({ type: 'blob' });
}