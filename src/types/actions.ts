import { Set } from 'immutable';
import { UUID } from './util';
import { Asset, Edge, HasStageId, Stage, Volume } from './base';
import { State } from './state';

/*
 * Actions begin here. Each of these actions represents a transformation
 * made on the application state.
 **/

export interface CreateAsset {
  type: 'CreateAsset';
  name: string;
  image: string;
  protobufCode: string;
}

/**
 * Set the assets. Used for adding and removing assets from the editor, as well as modifying them
 */
export interface SetAssets {
  type: 'SetAssets';
  assets: Set<Asset>;
}

export interface UpdateAsset {
  type: 'UpdateAsset';
  asset: Asset;
}

/**
 * Set the stages. Used when stages are added or removed from the editor
 */
export interface SetStages {
  type: 'SetStages';
  stages: Set<Stage>;
}

/**
 * Delete the stage with the given Id
 */
export interface DeleteStage {
  type: 'DeleteStage';
  stage: Stage;
}

/**
 * Used for updating one stage, in-place
 */
export interface UpdateStage {
  type: 'UpdateStage';
  /**
   * The given stage to update may have none or all of the properties. It does have to have a
   * stageId, however, so that the stage to update can be identified
   */
  stage: Partial<Stage> & HasStageId;
}

/**
 * Add a volume to an existing stage
 */
export interface AddVolume {
  type: 'AddVolume';
  stageId: UUID;
  volume: Volume;
}

/**
 * Set the edges. Used when connections are made or broken in the editor
 */
export interface SetEdges {
  type: 'SetEdges';
  edges: Set<Edge>;
}

/**
 * Set the entire state to a given value. This is used when loading state from a saved or
 * serialized version
 */
export interface RestoreState {
  type: 'RestoreState';
  state: State;
}

/**
 * Set the state back to default. Used for clearing the editor
 */
export interface ClearState {
  type: 'ClearState';
}

/**
 * The action type is defined as the union of all the possible actions in the editor
 */
export type Action =
  CreateAsset  |
  SetAssets    |
  UpdateAsset  |
  SetStages     |
  DeleteStage   |
  UpdateStage   |
  AddVolume    |
  SetEdges     |
  RestoreState |
  ClearState;