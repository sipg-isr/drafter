import { SimulationLinkDatum, SimulationNodeDatum } from 'd3-force';
import { IType } from 'protobufjs';
import { List, Set } from 'immutable';

export type MessageType = IType & { name: string };

/**
 * An RPC method that can be called on a compute node
 */
export interface RemoteMethod {
  name: string;
  requestType: MessageType;
  responseType: MessageType
}

export type UUID = string;
/**
 * Any object that has a UUID identifier
 */
export interface Identified {
  // A unique identifer for nodes in the graph
  id: UUID;
}

/**
 * this defines a model, which is a template from which nodes in the editor can be made
 */
export interface Model extends Identified {
  // The human-readable name of the model
  name: string;
  // An image name, like sipgisr/image-source:latest
  image: string;
  // A set of interfaces
  methods: Set<RemoteMethod>;
}

export interface Node extends SimulationNodeDatum, Identified {
  // The name of the individual node
  name: string;
  // The name of the model this node was created from
  modelName: string;
  // The image identifier of the model
  image: string;
  accessPoints: List<[Requester, Responder]>;
}

export type Requester  = Pick<RemoteMethod, 'name' | 'requestType'>  & SimulationNodeDatum & Identified;
export type Responder = Pick<RemoteMethod, 'name' | 'responseType'> & SimulationNodeDatum & Identified;
export type AccessPoint = Requester | Responder;

export interface Edge {
  requester: Requester;
  responder: Responder;
}

/**
 * Represents a model that is being dragged and its coordinates, or a lack of drag
 */
interface Coordinates {
  x: number;
  y: number;
}

/**
 * Represents an active drag.
 */
export interface Drag {
  /** the original offset between the cursor beginning and the coordinates in the SVG grid */
  offset: Coordinates;
  /** the current location of the cursor */
  cursor: Coordinates;
  /** the element being dragged */
  element: Node | AccessPoint;
}

/**
 * An edge in the graph
 */
type Connection = [AccessPoint, AccessPoint];