import { SimulationNodeDatum } from 'd3-force';
import { IType } from 'protobufjs';
import { List, Map, Set } from 'immutable';

export interface MessageType extends IType {
  name: string;
  streamed: boolean;
}

/**
 * Represents a model that is being dragged and its coordinates, or a lack of drag
 */
interface Coordinates {
  x: number;
  y: number;
}

export type SimulationNodeDatumWithRequiredCoordinates = SimulationNodeDatum & Coordinates;

export type UUID = string;

export interface HasRemoteMethodId {
  remoteMethodId: UUID;
}

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
 * An RPC method that forms part of a Model's interface
 */
export interface RemoteMethod extends HasRemoteMethodId {
  name: string;
  requestType: MessageType;
  responseType: MessageType
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

export interface Node extends SimulationNodeDatumWithRequiredCoordinates, HasNodeId, HasModelId {
  kind: 'Node';
  // The name of the individual node
  name: string;

  accessPoints: List<AccessPoint>;
}

export interface AccessPoint extends SimulationNodeDatumWithRequiredCoordinates, HasNodeId, HasRemoteMethodId, HasAccessPointId {
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
  requesterId: HasNodeId & HasAccessPointId;
  responderId: HasNodeId & HasAccessPointId;
}

/**
 * The global state for the application. This requires a few properties
 *
 */
export interface State {
  /** A set of models that have been onboarded onto the platform  */
  models: Set<Model>;

  /** A set of nodes that were instantiated into the graph */
  nodes: Set<Node>;

  /** A set of edges that connect the nodes in the graph */
  edges: Set<Edge>;

  /** A list of previous actions. Used for record-keeping */
  actions: List<Action>;
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

/*
 * Actions begin here. Each of these actions represents a transformation
 * made on the application state.
 **/

/**
 * Set the models. Used for adding and removing models from the editor, as well as modifying them
 */
export interface SetModels {
  type: 'SetModels';
  models: Set<Model>;
}

/**
 * Set the nodes. Used when nodes are added or removed from the editor
 */
export interface SetNodes {
  type: 'SetNodes';
  nodes: Set<Node>;
}

/**
 * Used for updating one node, in-place
 */
export interface UpdateNode {
  type: 'UpdateNode';
  node: Node;
}

/**
 * Set the edges. Used when connections are made or broken in the editor
 */
export interface SetEdges {
  type: 'SetEdges';
  edges: Set<Edge>;
}

/**
 * Set the entire state to a given value. This is used when loading state from a saved or
 * serialized version
 */
export interface RestoreState {
  type: 'RestoreState';
  state: State;
}

/**
 * Set the state back to default. Used for clearing the editor
 */
export interface ClearState {
  type: 'ClearState';
}

/**
 * The action type is defined as the union of all the possible actions in the editor
 */
export type Action = SetModels | SetNodes | UpdateNode | SetEdges | RestoreState | ClearState;