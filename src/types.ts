import { IType } from 'protobufjs';

export type MessageType = IType & { name: string };
export interface RemoteMethod {
  name: string;
  requestType: MessageType;
  responseType: MessageType
};

// this defines a model, which is a template from which nodes in the editor can be made
export interface Model {
  name: string;
  // An identifying image name, like sipgisr/image-source:latest
  image: string;
  // A list of interfaces
  methods: RemoteMethod[];
}

