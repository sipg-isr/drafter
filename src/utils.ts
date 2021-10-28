import { RemoteMethod, Model, Direction } from './types';
import { parse, Service } from 'protobufjs';
import { MD5 } from 'object-hash';
import { List } from 'immutable';

/**
 * Convert literal ProtoBuf code into a list of RemoteMethod's
 */
export function protobufToRemoteMethods(code: string): RemoteMethod[] | null {
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

    return services.flatMap(service => service
      .methodsArray
      .map(method => ({
        name: method.name,
        requestType: { ...root.lookupType(method.requestType).toJSON(), name: method.requestType},
        responseType: { ...root.lookupType(method.responseType).toJSON(), name: method.responseType},
      }))
    );
  } catch (e: any) {
    // I really hate exceptions, so we just return null here. TODO make this more sophisticated
    return null;
  }
};

/**
 * Convert a Remote Method to a human-readable string
 */
export function remoteMethodToString({ name, requestType, responseType }: RemoteMethod): string {
  return `${name}(${requestType.name}): ${responseType.name}`;
}

/**
 * Given a model, instantiate it so that it can be used in the simulation
 */
export function instantiateModel(model: Model): Model {
  return {
    ...model,
    methods: model.methods.reduce<List<RemoteMethod>>(
      (acc, method) => acc
        .push({ ...method, direction: Direction.Input })
        .push({ ...method, direction: Direction.Output }),
      List()
    )
  };
};

// Given an object, return a color value for it
export function objectToColor(obj: any): string {
  return `#${MD5(obj).slice(0,6)}`;
}

export function ellipsePolarToCartesian(
  theta: number,
  rx: number,
  ry: number,
  cx: number = 0,
  cy: number = 0
): [number, number] {
  const { sin, cos } = Math;
  return [
    rx * cos(theta) + cx,
    ry * sin(theta) + cy,
  ];
};
