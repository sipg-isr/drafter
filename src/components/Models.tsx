import React from 'react';
import {
  Button,
  Table
} from 'react-bootstrap';
import { List } from 'immutable';
import {  FaTrash } from 'react-icons/fa';
// Import types
import { Model } from '../types';
import { remoteMethodToString } from '../utils';
import EditModel from './EditModel';

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
          {models.map(model => <ModelView key={model.id} model={model} removeModel={() => {
            setModels(models.remove(models.indexOf(model)));
          }} />)}
          <EditModel addModel={(model: Model) => {
            setModels(models.push(model));
          }} />
        </tbody>
      </Table>
    </>
  );
}

FileList;