import { SimulationLinkDatum, SimulationNodeDatum } from 'd3-force';
import { IType } from 'protobufjs';
import { List, Set, Map } from 'immutable';

export type MessageType = IType & { name: string };

/**
 * An RPC method that forms part of a Model's interface
 */
export interface RemoteMethod {
  name: string;
  requestType: MessageType;
  responseType: MessageType
}

export type UUID = string;

export interface HasModelId {
  modelId: UUID;
}

export interface HasNodeId {
  nodeId: UUID;
}

export interface HasAccessPointId {
  accessPointId: UUID;
}

export interface HasEdgeId {
  edgeId: UUID;
}

/**
 * this defines a model, which is a template from which nodes in the editor can be made
 */
export interface Model extends HasModelId {
  kind: 'Model';
  // The human-readable name of the model
  name: string;
  // An image name, like sipgisr/image-source:latest
  image: string;
  // A set of interfaces
  methods: Set<RemoteMethod>;
}

export interface Node extends SimulationNodeDatum, HasNodeId, HasModelId {
  kind: 'Node';
  // The name of the individual node
  name: string;
}

export interface AccessPoint extends SimulationNodeDatum, HasNodeId, HasAccessPointId {
  kind: 'AccessPoint';
  /**
   * An AccessPoint can either be a Requester, which calls the methods of other nodes, or a
   * Responder, which responds to such calls
   */
  role: 'Requester' | 'Responder';
  /**
   * The message type is either the 'parameter type' of a requester or the 'return type' of a
   * responder. It determines which methods can be connected
   */
  type: MessageType;

  /**
   * The name of the method
   */
  name: string;
}

export interface Edge extends HasEdgeId {
  // TODO - use newtype pattern here?
  requesterId: UUID;
  responderId: UUID;
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