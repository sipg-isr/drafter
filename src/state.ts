import create from 'zustand';
import { redux } from 'zustand/middleware';
import { List, Set } from 'immutable';
import { v4 as uuid } from 'uuid';
import {
  Action,
  Edge,
  Model,
  Node,
  State,
  Result,
  ErrorKind
} from './types';
import {
  protobufToRemoteMethods,
  success,
  error
} from './utils';

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
function reducer(state: State, action: Action): Result<Partial<State>> {
  switch (action.type) {
  case 'CreateModel':
    const methods = protobufToRemoteMethods(action.protobufCode);
      if (methods) {
        return success({
            models: state.models.add({
              kind: 'Model',
              modelId: uuid(),
              name: action.name,
              image: action.image,
              methods
            })
        });
      } else {
        return error(
          ErrorKind.ParsingError,
          'Refusing to update state: Could not parse protobuf code'
        );
      }
    case 'SetModels':
      return success({ ...state, models: action.models });
    case 'UpdateModel':
      const currentModel = state.models.find(({ modelId }) => modelId === action.model.modelId);
      if (currentModel) {
        return success({
          models: state.models.remove(currentModel).add(action.model)
        });
      } else {
        return error(
          ErrorKind.ModelNotFound,
          `Refusing to modify state. Error in ${action.type}. Trying to update model with id ${action.model.modelId} but no model with that id currently exists in state`
        );
      }
    case 'SetNodes':
      return success({ nodes: action.nodes });
    case 'DeleteNode':
      const nodeToDelete = state.nodes.find(({ nodeId }) => nodeId === action.node.nodeId);
      if (nodeToDelete) {
        // We found the node, now delete it
        return success({ nodes: state.nodes.remove(nodeToDelete) });
      } else {
        return error(
          ErrorKind.NodeNotFound,
          `Error in ${action.type} in not find nodewith id ${action.node.nodeId}`
        );
      }
    case 'UpdateNode':
      // Find the current node in the set that has the given Id
      const currentNode = state.nodes.find(({ nodeId }) => nodeId === action.node.nodeId);
      // If the node exists...
      if (currentNode) {
        return success({
          nodes: state.nodes.remove(currentNode).add({ ...currentNode, ...action.node })
        });
      } else {
        // Couldn't find the existing node.
        return error(
          ErrorKind.ModelNotFound,
          `Refusing to modify state. Error in ${action.type}. Trying to update node with id ${action.node.nodeId} but no node with that id currently exists in state`
        );
      }
    case 'AddVolume':
      const node = state.nodes.find(({ nodeId }) => nodeId === action.nodeId);
      if (node) {
        const nodeWithUpdatedVolumes = {
          ...node,
          volumes: node.volumes.push(action.volume)
        };
        const nodes = state.nodes.remove(node).add(nodeWithUpdatedVolumes);
        return success({
          nodes
        });
      } else {
        return error(
          ErrorKind.ModelNotFound,
          `Refusing to modify state. Error in ${action.type}. Trying to add volume to node with id ${action.nodeId} but no node with that id currently exists in state`
        );
      }
    case 'SetEdges':
      return success({ edges: action.edges });
    case 'RestoreState':
      return success(action.state);
    case 'ClearState':
      return success(initialState);
  }
}

export const useStore = create(redux(
  (state: State, action: Action) => {
    const result = reducer(state, action);
    if (result.kind === 'Success') {
      const partialState = result.value;
      if (partialState.actions) {
        // If the reducer actually specified or changed the actions, then use those
        return { ...state, ...partialState };
      } else {
        // If it did not, then add the current action to the history
        return { ...state, ...partialState, actions: state.actions.push(action) };
      }
    } else {
      console.error(`Error ${result.errorKind} in ${action.type}: ${result.message}`);
      return state;
    }
  }, initialState));

export function useDispatch() {
  return useStore(state => state.dispatch);
}

export function useCreateModel() {
  return useStore(({ dispatch }) =>
    ({ name, image, protobufCode }: { name: string, image: string, protobufCode: string}) => dispatch({
      type: 'CreateModel',
      name,
      image,
      protobufCode
    }));
}

export function useUpdateModel() {
  return useStore(({ dispatch }) => (model: Model) => dispatch({ type: 'UpdateModel', model }));
}

export function useDeleteNode() {
  return useStore(({ dispatch }) => (node: Node) => dispatch({ type: 'DeleteNode', node }));
}

export function useUpdateNode() {
  return useStore(({ dispatch }) => (node: Node) => dispatch({ type: 'UpdateNode', node }));
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
export function useRestoreState() {
  return useStore(({ dispatch }) => (state: State) => dispatch({type: 'RestoreState', state }));
}