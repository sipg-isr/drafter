import { Set, List } from 'immutable';
import { Model, Node, Edge } from './base';
import { Action } from './actions';

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
