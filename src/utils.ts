import { Service, parse } from 'protobufjs';
import { MD5 } from 'object-hash';
import { List, Set } from 'immutable';
import  { v4 as uuid } from 'uuid';
import {
  Model,
  Node,
  RemoteMethod,
  Requester,
  Responder
} from './types';
// TODO perhaps move this type into types.ts to avoid a circular dependency?
import { State } from './state';

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
        requestType: { ...root.lookupType(method.requestType).toJSON(), name: method.requestType},
        responseType: { ...root.lookupType(method.responseType).toJSON(), name: method.responseType}
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
 * Given a model, instantiate it so that it can be used in the simulation
 */
export function instantiateModel(model: Model, name: string): Node {
  const accessPoints = model.methods.map(
    (remoteMethod) => {
      const { requestType, responseType } = remoteMethod;
      const requester: Requester = {
        name: remoteMethodToString(remoteMethod),
        requestType,
        id: uuid()
      };
      const responder: Responder = {
        name: remoteMethodToString(remoteMethod),
        responseType,
        id:
        uuid()
      };
      const result: [Requester, Responder] = [requester, responder];
      return result;
    }
  ).toList();
  return {
    name,
    id: uuid(),
    modelName: model.name,
    image: model.image,
    accessPoints
  };
}

/**
 * Can two methods be connected?
 */
export function compatibleMethods(requester: Requester, responder: Responder): boolean {
  return (requester.requestType.name === responder.responseType.name);
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
  if (files) {
    // If the thing actually exists...
    // We should make sure it has exactly one file
    if (files.size === 1) {
      // We can assert-nonnull here because we know the files list has a first element
      const file = files.first()!;
      return file.text();
    } else {
      console.error(`Attempted to upload more than one protobuf file for a model. Files were [${files.map(file => file.name).join(', ')}]}`);
      return null;
    }
  } else {
    return null;
  }
}

export function serializeState(state: State): string {
  return JSON.stringify(state);
}

export function deserializeState(serialized: string): State {
  return JSON.parse(serialized, (key, value) => {
    if (key === 'models') {
      return List(value);
    } else if (key === 'nodes') {
      return Set(value);
    } else if (key === 'edges') {
      return Set(value);
    } else {
      return;
    }
  });
}