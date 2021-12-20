import create from 'zustand';
import { redux } from 'zustand/middleware';
import { List, Set } from 'immutable';
import { v4 as uuid } from 'uuid';
import {
  Action,
  Asset,
  Edge,
  ErrorKind,
  Result,
  Stage,
  State
} from './types';
import {
  findAsset,
  findStage,
  protobufToRemoteMethods
} from './utils';

/**
 * The initial state when the application is first loaded. Also used when clearing the application
 * and restoring to this first state
 */
const initialState: State = {
  kind: 'State',
  assets: Set(),
  stages: Set(),
  edges: Set(),
  actions: List()
};

/**
 * This is the fundamental state management function for the application. It takes a state, and an
 * action and returns a new state.
 *
 * The core of all Drafter Application logic is defined in this function
 *
 * @param {State} state -
 *   The initial state, before any action takes place. If any failure occurs,
 *   this state will be restored
 * @param {Action} action - An action, which will be applied as a a modification against the State
 * @return {Result<Partial<State>>}
 *   A partial state object. This will define some properties of State, and the missing ones will
 *   be filled in from the initial State.
 */
function reducer(state: State, action: Action): Result<Partial<State>> {
  switch (action.type) {
  case 'CreateAsset':
    const methods = protobufToRemoteMethods(action.protobufCode);
    if (!('errorKind' in methods)) {
      return {
        assets: state.assets.add({
          kind: 'Asset',
          assetId: uuid(),
          name: action.name,
          image: action.image,
          methods
        })
      };
    } else {
      // If this is an error, than just return the error
      return methods;
    }
  case 'SetAssets':
    return { ...state, assets: action.assets };
  case 'UpdateAsset':
    // Try to find the asset
    const asset = findAsset(state.assets, action.asset.assetId);
    // If finding the asset returned an error, then just propagate that error
    if (asset.kind === 'Error') { return asset; }
    // If we can find the current asset, remove and replace it
    return {
      assets: state.assets.remove(asset).add(action.asset)
    };
  case 'AddStage':
    return { stages: state.stages.add(action.stage) };
  case 'SetStages':
    return { stages: action.stages };
  case 'DeleteStage':
    const stageToDelete = findStage(state.stages, action.stage.stageId);
    // If finding the stage gave us an error, return that error
    if (stageToDelete.kind === 'Error') { return stageToDelete; }
    return {
      stages: state.stages.remove(stageToDelete),
      // Filter out all edges that have the give stage Id
      edges: state.edges.filter(({ requesterId, responderId }) =>
        stageToDelete.stageId !== requesterId && stageToDelete.stageId !== responderId
      )
    };
  case 'UpdateStage':
    // Find the current stage in the set that has the given Id
    const stageToUpdate = findStage(state.stages, action.stage.stageId);
    // If we've got an error, return it
    if (stageToUpdate.kind === 'Error' ) { return stageToUpdate; }
    // If the stage exists...
    return {
      stages: state.stages.remove(stageToUpdate).add({ ...stageToUpdate, ...action.stage })
    };
  case 'AddVolume':
    const stageToAddVolume = findStage(state.stages, action.stageId);
    if (stageToAddVolume.kind === 'Error') { return stageToAddVolume; }
    const stageWithUpdatedVolumes = {
      ...stageToAddVolume,
      volumes: stageToAddVolume.volumes.push(action.volume)
    };
    const stages = state.stages.remove(stageToAddVolume).add(stageWithUpdatedVolumes);
    return { stages };
  case 'SetEdges':
    return { edges: action.edges };
  case 'AddEdge':
      return { edges: state.edges.add(action.edge) }
  case 'RestoreState':
    return action.state;
  case 'ClearState':
    return initialState;
  }
}

/**
 * A React Hook to bring the application State into scope
 */
export const useStore = create(redux(
  (state: State, action: Action) => {
    const partialState = reducer(state, action);
    if (partialState.kind !== 'Error') {
      if (partialState.actions) {
        // If the reducer actually specified or changed the actions, then use those
        return { ...state, ...partialState };
      } else {
        // If it did not, then add the current action to the history
        return { ...state, ...partialState, actions: state.actions.push([new Date(), action]) };
      }
    } else {
      // If our reducer returned an error:
      // Pull out the kind of error and message...
      const { errorKind, message } = partialState;
      // Log them to console
      console.error(`Error ${errorKind} in ${action.type}: ${message}`);
      // And keep the existing state
      return state;
    }
  }, initialState));

export function useDispatch() {
  return useStore(state => state.dispatch);
}
export function useCreateAsset() {
  return useStore(({ dispatch }) =>
    ({ name, image, protobufCode }: { name: string, image: string, protobufCode: string}) => dispatch({
      type: 'CreateAsset',
      name,
      image,
      protobufCode
    }));
}
export function useUpdateAsset() {
  return useStore(({ dispatch }) => (asset: Asset) => dispatch({ type: 'UpdateAsset', asset }));
}

export function useDeleteStage() {
  return useStore(({ dispatch }) => (stage: Stage) => dispatch({ type: 'DeleteStage', stage }));
}

export function useUpdateStage() {
  return useStore(({ dispatch }) => (stage: Stage) => dispatch({ type: 'UpdateStage', stage }));
}

export function useAssets(): [Set<Asset>, (assets: Set<Asset>) => void] {
  return useStore(state => [state.assets, ((assets: Set<Asset>) => state.dispatch({ type: 'SetAssets', assets }))]);
}
export function useStages(): [Set<Stage>, (stages: Set<Stage>) => void] {
  return useStore(state => [state.stages, ((stages: Set<Stage>) => state.dispatch({ type: 'SetStages', stages }))]);
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
export function useAddStage() {
  return useStore(({ dispatch }) => (stage: Stage) => dispatch({ type: 'AddStage', stage }));
}