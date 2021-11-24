import { List, Set } from 'immutable';
import { SimulationNodeDatum } from 'd3-force';
import { IType } from 'protobufjs';

export interface MessageType extends IType {
  name: string;
  streamed: boolean;
}

/**
 * Represents a model that is being dragged and its coordinates, or a lack of drag
 */
export interface Coordinates {
  x: number;
  y: number;
}

export type SimulationNodeDatumWithRequiredCoordinates = SimulationNodeDatum & Coordinates;

export type UUID = string;

export interface HasRemoteMethodId {
  remoteMethodId: UUID;
}

export interface HasModelId {
  modelId: UUID;
}

export interface HasNodeId {
  nodeId: UUID;
}

export interface HasAccessPointId {
  accessPointId: UUID;
}

export interface HasEdgeId {
  edgeId: UUID;
}

export interface HasVolumeId {
  volumeId: UUID;
}

/**
 * An RPC method that forms part of a Model's interface
 */
export interface RemoteMethod extends HasRemoteMethodId {
  name: string;
  requestType: MessageType;
  responseType: MessageType
}


/**
 * this defines a model, which is a template from which nodes in the editor can be made
 */
export interface Model extends HasModelId {
  kind: 'Model';
  // The human-readable name of the model
  name: string;
  // An image name, like sipgisr/image-source:latest
  image: string;
  // A set of interfaces
  methods: Set<RemoteMethod>;
}

/** A stage in the editor-- one computer */
export interface Node extends SimulationNodeDatumWithRequiredCoordinates, HasNodeId, HasModelId {
  kind: 'Node';
  /** The name of the individual node */
  name: string;

  /** a list of interfaces associated with the node */
  accessPoints: List<AccessPoint>;

  /** A list of volumes to be mounted with this node */
  volumes: List<Volume>;
}

export enum VolumeType {
  Bind = 'bind'
}

/**
 * A path on disk
 */
export type Path = string;

export interface Volume extends HasVolumeId {
  type: VolumeType;
  source: Path;
  target: Path;
}

export interface AccessPoint extends SimulationNodeDatumWithRequiredCoordinates, HasNodeId, HasRemoteMethodId, HasAccessPointId {
  kind: 'AccessPoint';
  /**
   * An AccessPoint can either be a Requester, which calls the methods of other nodes, or a
   * Responder, which responds to such calls
   */
  role: 'Requester' | 'Responder';
  /**
   * The message type is either the 'parameter type' of a requester or the 'return type' of a
   * responder. It determines which methods can be connected
   */
  type: MessageType;

  /**
   * The name of the method
   */
  name: string;
}

export interface Edge extends HasEdgeId {
  // TODO - use newtype pattern here?
  requesterId: HasNodeId & HasAccessPointId;
  responderId: HasNodeId & HasAccessPointId;
}