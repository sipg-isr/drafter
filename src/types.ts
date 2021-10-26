import { SimulationNodeDatum, SimulationLinkDatum } from 'd3-force';
import { IType } from 'protobufjs';

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
  methods: RemoteMethod[];
}

// TODO also create nodes for the node remoteMethods
