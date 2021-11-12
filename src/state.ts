import create from 'zustand';
import { redux } from 'zustand/middleware';
import { List, Set } from 'immutable';
import { v4 as uuid } from 'uuid';
import {
  Action,
  Edge,
  Model,
  Node,
  State
} from './types';
import { protobufToRemoteMethods } from './utils';

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
    case 'CreateModel':
      const methods = protobufToRemoteMethods(action.protobufCode)
      if (methods) {
        return {
          ...state,
          models: state.models.add({
            kind: 'Model',
            modelId: uuid(),
            name: action.name,
            image: action.image,
            methods
          })
        };
      } else {
        console.error('Refusing to update state: Could not parse protobuf code');
        return state;
      }
    case 'SetModels':
      return { ...state, models: action.models };
    case 'SetNodes':
      return { ...state, nodes: action.nodes };
    case 'UpdateNode':
      // Find the current node in the set that has the given Id
      const currentNode = state.nodes.find(({ nodeId }) => nodeId === action.node.nodeId)
      // If the node exists...
      if (currentNode) {
        return {
          ...state,
          nodes: state.nodes.remove(currentNode).add(action.node)
        };
      } else {
        // Couldn't find the existing node.
        console.error(`Refusing to modify state. Error in ${action.type}. Trying to update node with id ${action.node.nodeId} but no node with that id currently exists in state`);
        return state;
      }
    case 'SetEdges':
      return { ...state, edges: action.edges };
    case 'RestoreState':
      return action.state;
    case 'ClearState':
      return initialState;
  }
}

function addHistory(state: State, action: Action): State {
  return { ...state, actions: state.actions.push(action) };
}

function reducerWithHistory(state: State, action: Action): State {
  return addHistory(reducer(state, action), action);
}

export const useStore = create(redux(reducerWithHistory, initialState));

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

export function useUpdateNode() {
  return useStore(({ dispatch }) => (node: Node) => dispatch({ type: 'UpdateNode', node}));
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