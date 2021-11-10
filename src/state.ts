import create from 'zustand';
import { redux } from 'zustand/middleware';
import { List, Set } from 'immutable';
import {
  Action,
  Edge,
  Model,
  Node,
  State
} from './types';

/**
 * The initial state when the application is first loaded. Also used when clearing the application
 * and restoring to this first state
 */
const initialState: State = {
  models: Set(),
  nodes: Set(),
  edges: Set(),
  actions: List()
};

/**
 * This is the fundamental state management function for the application. It takes a state, and an
 * action and returns a new state
 */
function reducer(state: State, action: Action): State {
  switch (action.type) {
  case 'SetModels':
    return { ...state, models: action.models, actions: state.actions.push(action) };
  case 'SetNodes':
    return { ...state, nodes: action.nodes, actions: state.actions.push(action)  };
  case 'SetEdges':
    return { ...state, edges: action.edges, actions: state.actions.push(action)  };
  case 'RestoreState':
    return { ...action.state, actions: state.actions.push(action) };
  case 'ClearState':
    return { ...initialState, actions: state.actions.push(action) };
  }
}

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
export function useActions(): List<Action> {
  return useStore(state => state.actions);
}