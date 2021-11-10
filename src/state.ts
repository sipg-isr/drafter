import create from 'zustand';
import { Set } from 'immutable';
import {
  AccessPoint,
  Edge,
  HasAccessPointId,
  HasNodeId,
  Model,
  Node,
  UUID
} from './types';

interface SetModels {
  kind: 'SetModels';
  models: Set<Model>;
}

interface SetNodes {
  kind: 'SetNodes';
  nodes: Set<Node>;
}

interface SetEdges {
  kind: 'SetEdges';
  edges: Set<Edge>;
}

interface RestoreState {
  kind: 'RestoreState';
  state: State;
}

interface ClearState {
  kind: 'ClearState';
}

type Action = SetModels | SetNodes | SetEdges | RestoreState | ClearState;

function reducer(state: State, action: Action): State {
  switch (action.kind) {
    case 'SetModels':
      return { ...state, models: action.models };
    case 'SetNodes':
      return { ...state, nodes: action.nodes };
    case 'SetEdges':
      return { ...state, edges: action.edges };
    case 'RestoreState':
      return action.state;
    case 'ClearState':
      return { ...state, models: Set(), nodes: Set(), edges: Set() };
  }
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

  dispatch: (action: Action) => void;
}

export const useStore = create<State>(set => ({
  models:    Set(),
  nodes:    Set(),
  edges:    Set(),
  dispatch: action => set(state => reducer(state, action))
}));

export function useDispatch() {
  return useStore(state => state.dispatch);
}

export function useModels(): [Set<Model>, (models: Set<Model>) => void] {
  return useStore(state => [state.models, ((models: Set<Model>) => state.dispatch({ kind: 'SetModels', models }))]);
}
export function useNodes(): [Set<Node>, (nodes: Set<Node>) => void] {
  return useStore(state => [state.nodes, ((nodes: Set<Node>) => state.dispatch({ kind: 'SetNodes', nodes }))]);
}
export function useEdges(): [Set<Edge>, (edges: Set<Edge>) => void] {
  return useStore(state => [state.edges, ((edges: Set<Edge>) => state.dispatch({ kind: 'SetEdges', edges }))]);
}