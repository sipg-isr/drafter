import { SimulationNodeDatum, SimulationLinkDatum } from 'd3-force';
import { IType } from 'protobufjs';
import { List } from 'immutable';

export type MessageType = IType & { name: string };

/**
 * An RPC method that can be called on a compute node
 */
export interface RemoteMethod extends SimulationNodeDatum {
  name: string;
  requestType: MessageType;
  responseType: MessageType
};

/**
 * this defines a model, which is a template from which nodes in the editor can be made
 */
export interface Model extends SimulationNodeDatum {
  name: string;
  // An identifying image name, like sipgisr/image-source:latest
  image: string;
  // A list of interfaces
  methods: List<RemoteMethod>;
}

/**
 * All nodes inside the editor are either models or RemoteMethod's.
 */
export type EditorNode = Model | RemoteMethod;

/**
 * All links in the simulation are between two RemoteMethod's
 */
export type MethodLink = SimulationLinkDatum<RemoteMethod>;
