import create from 'zustand';
import { Set, List } from 'immutable';
import {
  Model,
  Node,
  Edge
} from './types';
import { instantiateModel } from './utils';

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
  setNodes: (models: Set<Node>) => void;
  removeNode: (node: Node) => void;
  /** A set of edges that connect the nodes in the graph */
  edges: Set<Edge>;
  /** take a given model, and add it to the editor */
  addModelToEditor: (model: Model) => void;
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

  removeNode: (node: Node) => set(({ nodes }) => ({
    nodes: nodes.remove(node)
  })),

  addModelToEditor: (model: Model) => set(({ nodes }) => ({
    nodes: nodes.add(instantiateModel(model, model.name))
  }))
}));

export const useModels = () => useStore(state => state.models);
export const useNodes = () => useStore(state => state.nodes);
export const useSetNodes = () => useStore(state => state.setNodes);
export const useAddModelToEditor = () => useStore(state => state.addModelToEditor);
export const useRemoveNode = () => useStore(state => state.removeNode);
