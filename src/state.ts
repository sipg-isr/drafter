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
  error,
  findAsset,
  findStage,
  protobufToRemoteMethods,
  success
} from './utils';

/**
 * The initial state when the application is first loaded. Also used when clearing the application
 * and restoring to this first state
 */
const initialState: State = {
  assets: Set(),
  stages: Set(),
  edges: Set(),
  actions: List()
};

/**
 * This is the fundamental state management function for the application. It takes a state, and an
 * action and returns a new state
 */
function reducer(state: State, action: Action): Result<Partial<State>> {
  switch (action.type) {
  case 'CreateAsset':
    const methods = protobufToRemoteMethods(action.protobufCode);
    if (methods) {
      return success({
        assets: state.assets.add({
          kind: 'Asset',
          assetId: uuid(),
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
  case 'SetAssets':
    return success({ ...state, assets: action.assets });
  case 'UpdateAsset':
    // Try to find the asset
    const findAssetResult = findAsset(state, action.asset.assetId);
    // If you can't find it, quit
    if (findAssetResult.kind === 'Error') { return findAssetResult; }
    // If we can find the current asset, remove and replace it
    const currentAsset = findAssetResult.value;
    return success({
      assets: state.assets.remove(currentAsset).add(action.asset)
    });
  case 'SetStages':
    return success({ stages: action.stages });
  case 'DeleteStage':
    const findStageResult = findStage(state, action.stage.stageId);
    // If we can't find the given stage, fail with an error
    if (findStageResult.kind === 'Error') { return findStageResult; }
    const stageToDelete = findStageResult.value;
    return success({ stages: state.stages.remove(stageToDelete) });
  case 'UpdateStage':
    // Find the current stage in the set that has the given Id
    const findStageResult_ = findStage(state, action.stage.stageId);
    // This name is supposed to be findStageResult. It is called findStageResult_ in protest of
    // Javascript insisting that a switch/case not introduce a new block scope, meaning that
    // naming the variable findStageResult would be considered a name collision. ECMAScript
    // committee, please implement a proper [match expression](https://doc.rust-lang.org/book/ch06-02-match.html)
    if (findStageResult_.kind === 'Error') { return findStageResult_; }
    const currentStage = findStageResult_.value;
    // If the stage exists...
    return success({
      stages: state.stages.remove(currentStage).add({ ...currentStage, ...action.stage })
    });
  case 'AddVolume':
    const findStageResult__ = findStage(state, action.stageId);
    if (findStageResult__.kind === 'Error') { return findStageResult__; }
    const stage = findStageResult__.value;
    const stageWithUpdatedVolumes = {
      ...stage,
      volumes: stage.volumes.push(action.volume)
    };
    const stages = state.stages.remove(stage).add(stageWithUpdatedVolumes);
    return success({
      stages
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