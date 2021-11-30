import { List, Set } from 'immutable';
import { Edge, Asset, Node } from './base';
import { Action } from './actions';

/**
 * The global state for the application. This requires a few properties
 *
 */
export interface State {
  /** A set of assets that have been onboarded onto the platform  */
  assets: Set<Asset>;

  /** A set of nodes that were instantiated into the graph */
  nodes: Set<Node>;

  /** A set of edges that connect the nodes in the graph */
  edges: Set<Edge>;

  /** A list of previous actions. Used for record-keeping */
  actions: List<[Date, Action]>;
}