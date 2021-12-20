import { Service, parse } from 'protobufjs';
import { MD5 } from 'object-hash';
import { List, Map, Set } from 'immutable';
import  { v4 as uuid } from 'uuid';
import { dump } from 'js-yaml';
import JSZip from 'jszip';
import {
  truncate
} from 'lodash';
import equal from 'fast-deep-equal';
import { DEFAULT_Y_RADIUS } from './constants';
import {
  AccessPointKind,
  Asset,
  Coordinates,
  Error,
  ErrorKind,
  HasRemoteMethodId,
  RemoteMethod,
  Requester,
  Responder,
  Result,
  Stage,
  State,
  UUID
} from './types';

// TODO perhaps move this type into types.ts to avoid a circular dependency?

/**
 * Create an error with an ErrorKind and message
 * @param {ErrorKind} errorKind
 * @param {string} message
 */
export function error(errorKind: ErrorKind, message: string): Error {
  return {
    kind: 'Error',
    errorKind,
    message
  };
}

/**
 * Convert literal ProtoBuf code into a list of RemoteMethod's
 * @param {string} code - the source code of a protobuf file
 * @returns {Set<RemoteMethod>} - a set of RemoteMethod objects representing the methods of the
 * node's interface
 */
export function protobufToRemoteMethods(code: string): Result<Set<RemoteMethod>> {
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

    // FlatMap all services' methodsArray's into one Set of RemoteMethods
    return Set(services.flatMap(service => service
      .methodsArray
      .map(method => ({
        kind: 'RemoteMethod',
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
    // If we get an exception at any point, return a ParsingError
    return error(ErrorKind.ParsingError, e.message);
  }
}

/**
 * Convert a Remote Method to a human-readable string
 * @param {RemoteMethod} method - a remote method
 * @return {string} a human-readable string
 */
export function remoteMethodToString({ name, requestType, responseType }: RemoteMethod): string {
  return `${name}(${requestType.name}): ${responseType.name}`;
}

/**
 * Keeps track of how many of each asset have been instantiated
 */
const idCounter: Map<UUID, number> = Map();

/**
 * Given a asset, instantiate it so that it can be used in the simulation
 * @param {Asset} asset
 * @param {string} name - the name to give the asset when it is instantiated
 * @return {Stage} a stage object created from the given `asset`, and named `name`
 */
export function instantiateAsset(
  asset: Asset,
  { remoteMethodId }: HasRemoteMethodId
): Result<Stage> {
  const stageId = uuid();

  const method = findRemoteMethod(asset, remoteMethodId);

  if (method.kind === 'RemoteMethod') {
    const { requester, responder } = methodToRequesterAndResponder(method);
    const name = truncate(`${asset.name}-${method.name}`, { length: 25 });
    const rx = Math.max(name.length * 6, 50);
    // TODO make this configurable somewhere
    return {
      kind: 'Stage',
      name,
      methodName: method.name,
      requester,
      responder,
      stageId,
      assetId: asset.assetId,
      volumes: List(),
      x: 0,
      y: 0,
      rx,
      ry: DEFAULT_Y_RADIUS
    };
  } else {
    return method;
  }
}

export function methodToRequesterAndResponder({ requestType, responseType }: RemoteMethod): {
  requester: Requester,
  responder: Responder
} {
  return {
    requester: {
      kind: 'Requester',
      type: requestType
    },
    responder: {
      kind: 'Responder',
      type: responseType
    }
  };
}

/**
 * Can two methods be connected?
 * @param {AccessPoint} left, right - two `AccessPoint`s, representing two methods
 * @return {boolean} whether the tow can be connected
 */
export function compatibleMethods(requester: Requester, responder: Responder): boolean {
  return equal(requester.type, responder.type);
}

/**
 * Given an object, return a color value for it
 * @param {any} obj - any object
 * @return {string} a hex code of the form '#XXXXXX' representing a color for the object
 */
export function objectToColor(obj: any): string {
  return `#${MD5(obj).slice(0,6)}`;
}

export function accessPointLocation({ x, y }: Coordinates, accessPointKind: AccessPointKind): Coordinates {
  return {
    x,
    y: accessPointKind === 'Requester' ? y + DEFAULT_Y_RADIUS : y - DEFAULT_Y_RADIUS
  };
}

/**
 * Calculate the x-y value of a point on an ellipse, based on radial coordinates
 * @param {number} theta - the angle of the point from the center, in radians
 * @param {number} rx - the x-axis radius of the ellipse
 * @param {number} ry - the y-axis radius of the ellipse
 * @param {number} cx - the x-coordinate of the center of the ellipse
 * @param {number} cy - the y-coordinate of the center of the ellipse
 * @return {Coordinates} the Cartesian coordinates of the point on the ellipse
 */
export function ellipsePolarToCartesian(
  theta: number,
  rx: number,
  ry: number,
  cx = 0,
  cy = 0
): Coordinates {
  const { sin, cos } = Math;
  return {
    x: rx * cos(theta) + cx,
    y: ry * sin(theta) + cy
  };
}

/**
 * A function that takes a react ref to a file input tag and outputs the plain-text value of the
 * currently-uploaded file
 * @param {HTMLInputElement} element - an HTML tag representing the file input element
 * @return {Promise<Result<string>>} a promise containing either the content of the file or an
 * error if the number of files attached was not exactly one
 */
export async function fileContent(element: HTMLInputElement): Promise<Result<string>> {
  // Get the set of files associated with the current file input
  // Note that we coerce to undefined in case of a falsy value here because the `Set`
  // constructor does not accept null.
  const files = List(element?.files || undefined);
  // We should make sure that the list has exactly one file
  if (files.size === 1) {
    // We can assert-nonnull here because we know the files list has a first element
    const file = files.first()!;
    // Get the content of the file
    const text = await file.text();
    return text;
  } else {
    return error(ErrorKind.FileInputError, `Didn't find exactly one protobuf file for the asset. Files were [${files.map(file => file.name).join(', ')}]}`);
  }
}

/**
 * Given the state of the application, serialize it into a string
 * @param {State} state
 * @return {string} a string containing all state information of the application
 */
export function serializeState(state: State): string {
  return JSON.stringify(state);
}

/**
 * Given a string, reconstitute it into application state
 * FIXME this function does not perform any validation, it just naïvely JSON-parses
 * @param {string} serialized - a string containing application state, as produced by the function
 * above
 * @return {State} the reconstituted state
 */
export function deserializeState(serialized: string): State {
  const parsed = JSON.parse(serialized, (key, value) => {
    if (
      key === 'accessPoints' ||
      key === 'actions' ||
      key === 'volumes'
    ) {
      return List(value);
    } else if (
      key === 'methods' ||
      key === 'assets' ||
      key === 'stages' ||
      key === 'edges'
    ) {
      return Set(value);
    } else {
      return value;
    }
  });
  return parsed;
}

/**
 * Convert the current application state into a docker-compose format
 * that can be used with https://github.com/DuarteMRAlves/Pipeline-Orchestrator
 * @param {State} state - the application state
 * @return {Promise<Blob>} a ZIP file containing the docker-compose.yml and config.yml files
 */
export async function exportState({ assets, stages, edges }: State): Promise<Blob> {
  const zip = new JSZip();

  // This object represents the docker-compose file
  // We don't have a schema for this yet, so we effectively disable type-checking by giving it the
  // `any` type
  const dockerCompose: any = {
    version: '3',
    services: {
      'orchestrator-stage': {
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

  stages.toList().forEach(({ name, assetId, volumes }, idx) => {
    const asset = assets.find(asset => asset.assetId === assetId);
    if (!(name in dockerCompose.services) && asset) {
      dockerCompose.services[name.replaceAll(/\s+/g, '-')] = {
        image: asset.image,
        volumes: volumes
          .map(({ source, target, type }) => ({ source, target, type }))
          .toArray(),
        ports: [`${8061 + idx}:8062`]
      };
    }
  });

  // This object represents the `config.yml` file
  const config: any = {
    stages: stages.map(({ name, assetId }) => ({
      name,
      // This must be the same as the name of the service, which is used as the key above
      host: name.replaceAll(/\s+/g, '-'),
      port: 8061
      // method
    })).toArray()

    /*links: edges.map(({ requesterId, responderId }) => {
      const sourceField = lookupAccessPoint(stages, responderId);
      const targetField = lookupAccessPoint(stages, requesterId);
      return ({
        source: {
          stage: stages.find(({ stageId }) => stageId === responderId.stageId)?.name || 'Stage not found',
          field: sourceField.kind === 'AccessPoint' ? sourceField : 'Method not found'
        },
        target: {
          stage: stages.find(({ stageId }) => stageId === requesterId.stageId)?.name || 'Stage not found',
          field: targetField.kind === 'AccessPoint' ? targetField : 'Method not found'
        }
      });
    }).toArray()*/
  };

  // Add the data to the zip as yaml
  zip.file('docker-compose.yml', dump(dockerCompose));
  zip.file('config.yml',         dump(config));

  // Generate a blob and return
  return zip.generateAsync({ type: 'blob' });
}

/**
 * Attempt to find the asset with the given ID
 * @param {State} state - the application state containing the assets to search
 * @param {UUID} id - the id to search for
 * @return {Result<Asset>} the found asset, or an error if not found
 */
export function findAsset(assets: Set<Asset>, id: UUID): Result<Asset> {
  const asset = assets.find(({ assetId }) => assetId === id);
  if (asset) {
    return asset;
  } else {
    return error(
      ErrorKind.AssetNotFound,
      `Cannot find Asset with id ${id}`
    );
  }
}

/**
 * Attempt to find the stage with the given ID
 * @param {State} state - the application state containing the stages to search
 * @param {UUID} id - the id to search for
 * @return {Result<Asset>} the found stage, or an error if not found
 */
export function findStage(stages: Set<Stage>, id: UUID): Result<Stage> {
  const stage = stages.find(({ stageId }) => stageId === id);
  if (stage) {
    return stage;
  } else {
    return error(
      ErrorKind.StageNotFound,
      `Cannot find Stage with id ${id}`
    );
  }
}

export function findRemoteMethod(asset: Asset, remoteMethodId: UUID): Result<RemoteMethod> {
  const method = asset.methods.find(method => method.remoteMethodId === remoteMethodId);
  if (method) {
    return method;
  } else {
    return error(
      ErrorKind.RemoteMethodNotFound,
      `Cannot find Remote Method with id ${remoteMethodId} in asset ${asset}`
    );
  }
}

/**
 * Given an error, print it to the console
 * @param {Error}
 */
export function reportError({ errorKind, message }: Error) {
  console.error(`${errorKind}: ${message}`);
}