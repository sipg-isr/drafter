import React, { useRef, useState } from 'react';
import {
  Button,
  Form,
  Table
} from 'react-bootstrap';
import { List, Set } from 'immutable';
import { FaPlus, FaTrash } from 'react-icons/fa';
// Import types
import { Model } from '../types';
import { protobufToRemoteMethods, remoteMethodToString } from '../utils';

interface ModelViewProps {
  model: Model;
  removeModel: () => void;
}
function ModelView({ model: { name, image, methods }, removeModel }: ModelViewProps) {
  return (
    <tr>
      <td>{name}</td>
      <td><pre>{image}</pre></td>
      <td>{methods.map(method =>
        <pre key={method.name}>{remoteMethodToString(method)}</pre>
      )}</td>
      <td><Button variant='danger' onClick={removeModel}><FaTrash /></Button></td>
    </tr>
  );
}

interface ModelAddingFormProps {
  addModel: (model: Model) => void;
}
function ModelAddingForm({ addModel }: ModelAddingFormProps) {
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const filesRef = useRef<HTMLInputElement | null>(null);
  // A function that returns the plain-text value of the currently-uploaded file
  const fileContent: () => Promise<string | null> = async () => {
    // Get the set of files associated with the current file input
    // Note that we coerce to undefined in case of a falsy value here because the `Set`
    // constructor does not accept null.
    const files = List(filesRef?.current?.files || undefined);
    if (files) {
      // If the thing actually exists...
      // We should make sure it has exactly one file
      if (files.size === 1) {
        // We can assert-nonnull here because we know the files list has a first element
        const file = files.first()!;
        return file.text();
      } else {
        console.error(`Attempted to upload more than one protobuf file for a model. Files were [${files.map(file => file.name).join(', ')}]}`);
        return null;
      }
    } else {
      return null;
    }
  };
  return (
    <>
      <tr>
        <td>
          <Form.Control
            placeholder='My model name'
            value={name}
            onChange={event => setName(event.target.value)}
          />
        </td>
        <td>
          <Form.Control
            placeholder='<dockerid>/<reponame>'
            value={image}
            onChange={event => setImage(event.target.value)}
          />
        </td>
        <td>
          <Form.Control
            type='file'
            ref={filesRef}
            accept='.proto'
          />
        </td>
        <td>
          <Button
            variant='success'
            onClick={async () => {
              addModel({
                name,
                image,
                // TODO show an error message and abort if this is null
                methods: protobufToRemoteMethods(await fileContent() || '') || Set()
              });
              // Clear all the fields
              setName('');
              setImage('');
              // TODO delete the file ref
            }}><FaPlus /></Button>
        </td>
      </tr>
    </>
  );
}

interface ModelsProps {
  models: List<Model>;
  setModels: (models: List<Model>) => void;
}
export default function Models({ models, setModels }: ModelsProps) {
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
          {models.map(model => <ModelView key={model.name + Math.random()} model={model} removeModel={() => {
            setModels(models.remove(models.indexOf(model)));
          }} />)}
          <ModelAddingForm addModel={(model: Model) => {
            setModels(models.push(model));
          }} />
        </tbody>
      </Table>
    </>
  );
}

FileList;