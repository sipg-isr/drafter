import create from 'zustand';
import { List, Set } from 'immutable';
import {
  Edge,
  Model,
  Node
} from './types';

/**
 * The global state for the application. This requires a few properties
 *
 */
export interface State {
  /** A set of models that have been onboarded onto the platform  */
  models: List<Model>;
  setModels: (models: List<Model>) => void;
  /** A set of nodes that were instantiated into the graph */
  nodes: Set<Node>;
  setNodes: (nodes: Set<Node>) => void;
  /** A set of edges that connect the nodes in the graph */
  edges: Set<Edge>;
  setEdges: (edges: Set<Edge>) => void;

  /** Set the entire state, from new */
  restoreState: (state: State) => void;
}

export const useStore = create<State>(set => ({
  models:    List(),
  setModels: models => set(() => ({ models })),
  nodes:    Set(),
  setNodes: nodes => set(() => ({ nodes })),
  edges:    Set(),
  setEdges: edges => set(() => ({ edges })),
  restoreState: state => set(state, false)
}));

export function useModels(): [List<Model>, (models: List<Model>) => void] {
  return useStore(state => [state.models, state.setModels]);
}
export function useNodes(): [Set<Node>, (nodes: Set<Node>) => void] {
  return useStore(state => [state.nodes, state.setNodes]);
}
export function useEdges(): [Set<Edge>, (edges: Set<Edge>) => void] {
  return useStore(state => [state.edges, state.setEdges]);
}