import React, { useState } from 'react';
import {
  Table,
  Form,
  Button
} from 'react-bootstrap';
import { IType, parse, Service } from 'protobufjs';
import { List } from 'immutable';

type MessageType = IType & { name: string };
interface RemoteMethod {
  name: string;
  requestType: MessageType;
  responseType: MessageType
};

function remoteMethodToString({ name, requestType, responseType }: RemoteMethod): string {
  return `${name}(${requestType.name}): ${responseType.name}`;
}


// this defines a model, which is a template from which nodes in the editor can be made
interface Model {
  name: string;
  // An identifying image name, like sipgisr/image-source:latest
  image: string;
  // A list of interfaces
  methods: RemoteMethod[];
}

interface ModelViewProps {
  model: Model;
};

/**
 * A utility function to convert ProtoBuf code into a list of RemoteMethod's
 */
function protobufToRemoteMethods(code: string): RemoteMethod[] | null {
  try {
    // Parse out the root object from the ProtoBuf code
    const { root } = parse(code);
    // this is a bit of a hack to get only the services.
    // We start with all the contained objects (nestedArray)
    // Then we filter out only the ones whose JSON representations have a `methods` field
    // Finally, we cast to `Service` objects
    const services = root
      .nestedArray
      .filter(reflectionObject => reflectionObject.toJSON().methods)
      .map(obj => obj as Service);

    return services.flatMap(service => service
      .methodsArray
      .map(method => ({
        name: method.name,
        requestType: { ...root.lookupType(method.requestType).toJSON(), name: method.requestType},
        responseType: { ...root.lookupType(method.responseType).toJSON(), name: method.responseType},
      }))
    );
  } catch (e: any) {
    // I really hate exceptions, so we just return null here. TODO make this more sophisticated
    return null;
  }
};

function ModelView({ model: { name, image, methods } }: ModelViewProps) {
  return (
    <tr>
      <td>{name}</td>
      <td><pre>{image}</pre></td>
      <td>{methods.map(method =>
        <pre>{remoteMethodToString(method)}</pre>
      )}</td>
      <td>TODO</td>
    </tr>
  );
};

interface ModelAddingFormProps {
  addModel: (model: Model) => void;
};
function ModelAddingForm({ addModel }: ModelAddingFormProps) {
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [protobufCode, setProtobufCode] = useState('');
  return (
    <>
      <tr>
        <td>
          <Form.Control
            placeholder="My model name"
            value={name}
            onChange={event => setName(event.target.value)}
          />
        </td>
        <td>
          <Form.Control
            placeholder="<dockerid>/<reponame>"
            value={image}
            onChange={event => setImage(event.target.value)}
          />
        </td>
        <td>
          <Form.Control
            as="textarea"
            placeholder="paste in protobuf here"
            value={protobufCode}
            onChange={event => setProtobufCode(event.target.value)}
          />
        </td>
        <td>
          <Button onClick={() => {
            addModel({
              name,
              image,
              // TODO show an error message and abort if this is null
              methods: protobufToRemoteMethods(protobufCode) || []
            });
            // Clear all the fields
            setName('');
            setImage('');
            setProtobufCode('');
          }}>Add model</Button>
        </td>
      </tr>
    </>
  );
};

export default function Models() {
  // TODO make this an immutable data type and store it somewhere like, localStorage or idb-keyval
  // write a custom hook to serialize / deserialize this
  const [models, setModels] = useState<List<Model>>(List());

  return (
    <>
      <Table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Image</th>
            <th>Protobuf Interface</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {models.map(model => <ModelView model={model} />)}
          <ModelAddingForm addModel={(model: Model) => {
            setModels(models.push(model));
          }} />
        </tbody>
      </Table>
    </>
  );
}
