import create from 'zustand';
import { Set, List } from 'immutable';
import {
  Model,
  Node,
  Edge
} from './types';

/**
 * The global state for the application. This requires a few properties
 *
 */
interface State {
  /** A set of models that have been onboarded onto the platform  */
  models: List<Model>;
  setModels: (models: List<Model>) => void;
  /** A set of nodes that were instantiated into the graph */
  nodes: Set<Node>;
  setNodes: (nodes: Set<Node>) => void;
  /** A set of edges that connect the nodes in the graph */
  edges: Set<Edge>;
};

export const useStore = create<State>(set => ({
  models: List(),
  nodes: Set(),
  edges: Set(),
  setModels: (models: Iterable<Model>) => set(() => ({
    models: List(models)
  })),

  setNodes: (nodes: Iterable<Node>) => set(() => ({
    nodes: Set(nodes)
  })),
}));

export function useModels(): [List<Model>, (models: List<Model>) => void] {
  return useStore(state => [state.models, state.setModels]);
}
export function useNodes(): [Set<Node>, (nodes: Set<Node>) => void] {
  return useStore(state => [state.nodes, state.setNodes]);
}
