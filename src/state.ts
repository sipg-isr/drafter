import create from 'zustand';
import { redux } from 'zustand/middleware';
import { List, Set } from 'immutable';
import { v4 as uuid } from 'uuid';
import {
  Action,
  Edge,
  ErrorKind,
  Model,
  Node,
  Result,
  State
} from './types';
import {
  error,
  findModel,
  findNode,
  protobufToRemoteMethods,
  success
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
    // Try to find the model
    const findModelResult = findModel(state, action.model.modelId);
    // If you can't find it, quit
    if (findModelResult.kind === 'Error') { return findModelResult; }
    // If we can find the current model, remove and replace it
    const currentModel = findModelResult.value;
    return success({
      models: state.models.remove(currentModel).add(action.model)
    });
  case 'SetNodes':
    return success({ nodes: action.nodes });
  case 'DeleteNode':
    const findNodeResult = findNode(state, action.node.nodeId);
    // If we can't find the given node, fail with an error
    if (findNodeResult.kind === 'Error') { return findNodeResult; }
    const nodeToDelete = findNodeResult.value;
    return success({ nodes: state.nodes.remove(nodeToDelete) });
  case 'UpdateNode':
    // Find the current node in the set that has the given Id
    const findNodeResult_ = findNode(state, action.node.nodeId);
    // This name is supposed to be findNodeResult. It is called findNodeResult_ in protest of
    // Javascript insisting that a switch/case not introduce a new block scope, meaning that
    // naming the variable findNodeResult would be considered a name collision. ECMAScript
    // committee, please implement a proper [match expression](https://doc.rust-lang.org/book/ch06-02-match.html)
    if (findNodeResult_.kind === 'Error') { return findNodeResult_; }
    const currentNode = findNodeResult_.value;
    // If the node exists...
    return success({
      nodes: state.nodes.remove(currentNode).add({ ...currentNode, ...action.node })
    });
  case 'AddVolume':
    const findNodeResult__ = findNode(state, action.nodeId);
    if (findNodeResult__.kind === 'Error') { return findNodeResult__; }
    const node = findNodeResult__.value;
    const nodeWithUpdatedVolumes = {
      ...node,
      volumes: node.volumes.push(action.volume)
    };
    const nodes = state.nodes.remove(node).add(nodeWithUpdatedVolumes);
    return success({
      nodes
    });
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
        return { ...state, ...partialState, actions: state.actions.push([new Date(), action]) };
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
export function useActions(): List<[Date, Action]> {
  return useStore(state => state.actions);
}
export function useRestoreState() {
  return useStore(({ dispatch }) => (state: State) => dispatch({type: 'RestoreState', state }));
}