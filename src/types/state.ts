import { List, Set } from 'immutable';
import { Asset, Edge, Stage } from './base';
import { Action } from './actions';

/**
 * The global state for the application. This requires a few properties
 *
 */
export interface State {
  kind: 'State';
  /** A set of assets that have been onboarded onto the platform  */
  assets: Set<Asset>;

  /** A set of stages that were instantiated into the graph */
  stages: Set<Stage>;

  /** A set of edges that connect the stages in the graph */
  edges: Set<Edge>;

  /** A list of previous actions. Used for record-keeping */
  actions: List<[Date, Action]>;
}