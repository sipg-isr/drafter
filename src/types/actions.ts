import { Set } from 'immutable';
import { UUID } from './util';
import { Edge, HasNodeId, Model, Node, Volume } from './base';
import { State } from './state';

/*
 * Actions begin here. Each of these actions represents a transformation
 * made on the application state.
 **/

export interface CreateModel {
  type: 'CreateModel';
  name: string;
  image: string;
  protobufCode: string;
}

/**
 * Set the models. Used for adding and removing models from the editor, as well as modifying them
 */
export interface SetModels {
  type: 'SetModels';
  models: Set<Model>;
}

export interface UpdateModel {
  type: 'UpdateModel';
  model: Model;
}

/**
 * Set the nodes. Used when nodes are added or removed from the editor
 */
export interface SetNodes {
  type: 'SetNodes';
  nodes: Set<Node>;
}

/**
 * Delete the node with the given Id
 */
export interface DeleteNode {
  type: 'DeleteNode';
  node: Node;
}

/**
 * Used for updating one node, in-place
 */
export interface UpdateNode {
  type: 'UpdateNode';
  /**
   * The given node to update may have none or all of the properties. It does have to have a
   * nodeId, however, so that the node to update can be identified
   */
  node: Partial<Node> & HasNodeId;
}

/**
 * Add a volume to an existing node
 */
export interface AddVolume {
  type: 'AddVolume';
  nodeId: UUID;
  volume: Volume;
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
export type Action =
  CreateModel  |
  SetModels    |
  UpdateModel  |
  SetNodes     |
  DeleteNode   |
  UpdateNode   |
  AddVolume    |
  SetEdges     |
  RestoreState |
  ClearState;