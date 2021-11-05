import create from 'zustand';
import { Map } from 'immutable';
import {
  Edge,
  Model,
  Node,
  UUID,
  HasNodeId,
  HasAccessPointId,
  AccessPoint
} from './types';

/**
 * The global state for the application. This requires a few properties
 *
 */
export interface State {
  /** A set of models that have been onboarded onto the platform  */
  models: Map<UUID, Model>;
  setModels: (models: Map<UUID, Model>) => void;
  /** A set of nodes that were instantiated into the graph */
  nodes: Map<UUID, Node>;
  setNodes: (nodes: Map<UUID, Node>) => void;

  /** A set of edges that connect the nodes in the graph */
  edges: Map<UUID, Edge>;
  setEdges: (edges: Map<UUID, Edge>) => void;

  /** Set the entire state, from new */
  restoreState: (state: State) => void;
}

export const useStore = create<State>(set => ({
  models:    Map(),
  setModels: models => set(() => ({ models })),
  nodes:    Map(),
  setNodes: nodes => set(() => ({ nodes })),
  edges:    Map(),
  setEdges: edges => set(() => ({ edges })),
  restoreState: state => set(state, false)
}));

export function useModels(): [Map<UUID, Model>, (models: Map<UUID, Model>) => void] {
  return useStore(state => [state.models, state.setModels]);
}
export function useNodes(): [Map<UUID, Node>, (nodes: Map<UUID, Node>) => void] {
  return useStore(state => [state.nodes, state.setNodes]);
}
export function useEdges(): [Map<UUID, Edge>, (edges: Map<UUID, Edge>) => void] {
  return useStore(state => [state.edges, state.setEdges]);
}