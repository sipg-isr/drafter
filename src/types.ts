import { SimulationNodeDatum, SimulationLinkDatum } from 'd3-force';
import { IType } from 'protobufjs';
import { Set, List } from 'immutable';

export type UUID = string;

export type MessageType = IType & { name: string };

/**
 * An RPC method that can be called on a compute node
 */
export interface RemoteMethod {
  name: string;
  requestType: MessageType;
  responseType: MessageType
}

/**
 * this defines a model, which is a template from which nodes in the editor can be made
 */
export interface Model {
  // The human-readable name of the model
  name: string;
  // An image name, like sipgisr/image-source:latest
  image: string;
  // A set of interfaces
  methods: Set<RemoteMethod>;
}

export interface Node extends SimulationNodeDatum {
  // The name of the individual node
  name: string;
  id: UUID;
  // The name of the model this node was created from
  modelName: string;
  // The image identifier of the model
  image: string;
  accessPoints: List<[Input, Output]>;
}

export type Input = Pick<RemoteMethod,  'name' | 'requestType'>;
export type Output = Pick<RemoteMethod, 'name' | 'responseType'>;
export type AccessPoint = Input | Output;
