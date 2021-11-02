import React, { useState } from 'react';
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
  const [protobufCode, setProtobufCode] = useState('');
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
            as='textarea'
            placeholder='paste in protobuf here'
            value={protobufCode}
            onChange={event => setProtobufCode(event.target.value)}
          />
        </td>
        <td>
          <Button
            variant='success'
            onClick={() => {
              addModel({
                name,
                image,
                // TODO show an error message and abort if this is null
                methods: Set(protobufToRemoteMethods(protobufCode) || [])
              });
              // Clear all the fields
              setName('');
              setImage('');
              setProtobufCode('');
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
          {models.map(model => <ModelView key={model.name} model={model} removeModel={() => {
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
