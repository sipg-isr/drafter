import { Set } from 'immutable';
import { UUID } from './util';
import { Asset, Edge, HasStageId, Stage, Volume } from './base';
import { State } from './state';

/**
 * Actions begin here. Each of these actions represents a transformation
 * made on the application state. In a sense, every action a user takes to modify the document
 * will be recorded and processed as an action
 */

/**
 * An action that adds a new Asset to the editor
 * @interface
 * @property {string} name - The human-readable name of the Asset
 * @property {string} image -
 *   The string identifying the Docker image. This should be of the form
 *   [account]/[imagename] or [account]/[imagename]:[tag}
 */
export interface CreateAsset {
  type: 'CreateAsset';
  name: string;
  image: string;
  protobufCode: string;
}

/**
 * An action set the assets. Used for adding and removing assets from the editor, as well as modifying them
 * @interface
 * @property {Set<Asset>} assets - the new assets to use
 */
export interface SetAssets {
  type: 'SetAssets';
  assets: Set<Asset>;
}

/**
 * An action to update or modify one particular Asset
 * @interface
 * @property {Asset} asset - The asset to modify.
 */
export interface UpdateAsset {
  type: 'UpdateAsset';
  asset: Asset;
}

/**
 * An action to set the stages. Used when stages are added or removed from the editor
 * @interface
 * @property {Set<Stage>} stages - the stages to use
 */
export interface SetStages {
  type: 'SetStages';
  stages: Set<Stage>;
}

/**
 * An action to add a stage to the editor
 * @interface
 * @property {Stage} stage - the stage to add
 */
export interface AddStage {
  type: 'AddStage';
  stage: Stage;
}

/**
 * An action to delete the given stage
 * @interface
 * @property {Stage} stage - the stage to delete
 */
export interface DeleteStage {
  type: 'DeleteStage';
  stage: Stage;
}

/**
 * An action to update one stage, in-place
 * @interface
 * @property {Partial<Stage> & HasStageId} stage -
 *   The stage to update.The given stage object may have none or all of the properties of a Stage.
 *   It does have to have a stageId, however, so that the stage to update can be identified
 */
export interface UpdateStage {
  type: 'UpdateStage';
  stage: Partial<Stage> & HasStageId;
}

/**
 * An action to add a volume to an existing stage
 * @interface
 * @property {UUID} stageId - the Id of the stage to which the volume will be added
 * @property {Volume} volume - the volume to add
 */
export interface AddVolume {
  type: 'AddVolume';
  stageId: UUID;
  volume: Volume;
}

/**
 * An action to set the edges. Used when connections are made or broken in the editor
 * @interface
 * @property {Set<Edges>} edges - the edges to use
 */
export interface SetEdges {
  type: 'SetEdges';
  edges: Set<Edge>;
}

/**
 * An action to set the entire state to a given value. This is used when loading state from a
 * saved or serialized version
 * @interface
 * @property {State} state - the State to restore
 */
export interface RestoreState {
  type: 'RestoreState';
  state: State;
}

/**
 * An action to set the state back to default. Used for clearing the editor
 * @interface
 */
export interface ClearState {
  type: 'ClearState';
}

/**
 * An Action that can be performed to update the state of the editor.
 * This type is defined as the union of all possible action types
 */
export type Action =
  CreateAsset  |
  SetAssets    |
  UpdateAsset  |
  AddStage     |
  SetStages    |
  DeleteStage  |
  UpdateStage  |
  AddVolume    |
  SetEdges     |
  RestoreState |
  ClearState;