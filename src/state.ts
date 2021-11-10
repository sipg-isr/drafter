import create from 'zustand';
import { redux } from 'zustand/middleware';
import { Set } from 'immutable';
import {
  Edge,
  Model,
  Node,
} from './types';

interface SetModels {
  type: 'SetModels';
  models: Set<Model>;
}

interface SetNodes {
  type: 'SetNodes';
  nodes: Set<Node>;
}

interface SetEdges {
  type: 'SetEdges';
  edges: Set<Edge>;
}

interface RestoreState {
  type: 'RestoreState';
  state: State;
}

interface ClearState {
  type: 'ClearState';
}

type Action = SetModels | SetNodes | SetEdges | RestoreState | ClearState;

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
}

/**
 * This is the fundamental state management function for the application. It takes a state, and an
 * action and returns a new state
 */
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SetModels':
      return { ...state, models: action.models };
    case 'SetNodes':
      return { ...state, nodes: action.nodes };
    case 'SetEdges':
      return { ...state, edges: action.edges };
    case 'RestoreState':
      return action.state;
    case 'ClearState':
      return initialState;
  }
}

const initialState: State = {
  models: Set(),
  nodes: Set(),
  edges: Set()
};
export const useStore = create(redux(reducer, initialState));

export function useDispatch() {
  return useStore(state => state.dispatch);
}

export function useModels(): [Set<Model>, (models: Set<Model>) => void] {
  return useStore(state => [state.models, ((models: Set<Model>) => state.dispatch({ type: 'SetModels', models }))]);
}
export function useNodes(): [Set<Node>, (nodes: Set<Node>) => void] {
  return useStore(state => [state.nodes, ((nodes: Set<Node>) => state.dispatch({ type: 'SetNodes', nodes }))]);
}
export function useEdges(): [Set<Edge>, (edges: Set<Edge>) => void] {
  return useStore(state => [state.edges, ((edges: Set<Edge>) => state.dispatch({ type: 'SetEdges', edges }))]);
}