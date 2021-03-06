import { List, Set } from 'immutable';
import { SimulationNodeDatum } from 'd3-force';
import { IType } from 'protobufjs';
import { Coordinates, Path, UUID } from './util';

/**
 * A simple extension of the Protobuf Message Type
 * Adds the name of the type, which for us is important, and a single boolean field denoting
 * whether the message is streamed
 */
export interface MessageType extends IType {
  name: string;
  streamed: boolean;
}

/**
 * A Node in a d3-force simulation that has required x and y coordinates
 * The SimulationNodeDatum type has x: number and y: number properties, but they are both marked
 * as optional. This type makes them required
 */
export type SimulationNodeDatumWithRequiredCoordinates = SimulationNodeDatum & Coordinates;

/**
 * Begin Id classes
 */

/**
 * An object that either is a Remote Method or has exactly one associated Remote Method
 * @interface
 * @property {UUID} remoteMethodId - a UUID to uniquely identify the Remote Method
 */
export interface HasRemoteMethodId {
  remoteMethodId: UUID;
}

export interface HasRequesterId {
  requesterId: UUID;
}

export interface HasResponderId {
  responderId: UUID;
}

/**
 * An object that either is an Asset or has exactly one associated Asset
 * @interface
 * @property {UUID} assetId - a UUID to uniquely identify the Asset
 */
export interface HasAssetId {
  assetId: UUID;
}

/**
 * An object that either is a Stage or has exactly one associated Stage
 * @interface
 * @property {UUID} stageId - a UUID to uniquely identify the stage
 */
export interface HasStageId {
  stageId: UUID;
}

/**
 * An object that either is an Edge or has exactly one associated Edge
 * @interface
 * @property {UUID} edgeId - a UUID to uniquely identify the Edge
 */
export interface HasEdgeId {
  edgeId: UUID;
}

/**
 * An object that either is an Edge or has exactly one associated Edge
 * @interface
 * @property {UUID} edgeId - a UUID to uniquely identify the Edge
 */
export interface HasVolumeId {
  volumeId: UUID;
}

/**
 * An RPC method that forms part of a Asset's interface
 * @interface
 * @property {string} name
 * @property {MessageType} requestType - the type of the expected inputs to the method
 * @property {MessageType} responseType - the type of the outputs of the method
 */
export interface RemoteMethod extends HasRemoteMethodId {
  kind: 'RemoteMethod';
  name: string;
  requestType: MessageType;
  responseType: MessageType
}


/**
 * An Asset is a template from which stages in the editor can be made
 * @interface
 * @property {string} name               - The human-readable name of the asset
 * @property {string} image              - An image name, like sipgisr/image-source:latest
 * @property {Set<RemoteMethod>} methods - The method-interfaces exposed by this asset
 */
export interface Asset extends HasAssetId {
  kind: 'Asset';
  name: string;
  image: string;
  methods: Set<RemoteMethod>;
}

/**
 * A stage is one computer in the distributed system. It is created from an Asset, has a name, and
 * takes inputs and returns outputs
 * @interface
 * @property {string} - name
 * @property {List<AccessPoint>} accessPoints -
 *   A list of interfaces associated with the stage. This list is created from the parent Asset's
 *   methods object, with each RemoteMethod converted into a pair of AccessPoint's, one for input
 *   and the other for output. These AccessPoint's can then be connected to other nodes to
 *   establish a network topology
 * @property {List<Volume>} volumes -
 *   A set of volumes, serving as disk mappings from a path on the container to a path on the host
 *   disk. Adding these volumes allows one to directly manipulate files in a running system
 */
export interface Stage extends SimulationNodeDatumWithRequiredCoordinates, HasStageId, HasAssetId {
  kind: 'Stage';
  name: string;
  methodName: string;
  requester: Requester;
  responder: Responder;
  volumes: List<Volume>;
  // The radii of the ellipse
  rx: number;
  ry: number;
}

export interface Requester {
  kind: 'Requester';
  type: MessageType;
}

export interface Responder {
  kind: 'Responder';
  type: MessageType;
}

export type AccessPoint = Requester | Responder;
export type AccessPointKind = 'Requester' | 'Responder';

/**
 * A simple enum specifying what kind of volume binding will be used. Currently, only bind is
 * supported.
 */
export enum VolumeType {
  Bind = 'bind'
}

/**
 * A disk volume mapping. Allows a mapping between a path in the container and a path on disk
 */
export interface Volume extends HasVolumeId {
  type: VolumeType;
  source: Path;
  target: Path;
}

/**
 * An edge connecting two matching AccessPoint's
 * @interface
 * @property {UUID} requesterId -
 *   A stageId, that identifies a stage and the accessPoint in that stage that
 *   will be the requester
 * @property {UUID} responderId -
 *   Same as above, but for the responder
 */
export interface Edge extends HasEdgeId {
  /**
   * Both UUID's represent Stage's
   */
  requesterId: UUID;
  responderId: UUID;
}