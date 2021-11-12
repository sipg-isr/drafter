import React, { useEffect, useState, useRef } from 'react';
import {
  Button,
  Table,
  Form
} from 'react-bootstrap';
import { List, Map, Set } from 'immutable';
import { FaTrash, FaPlus } from 'react-icons/fa';
import { remoteMethodToString, fileContent } from '../utils';
import { useModels, useCreateModel, useUpdateModel } from '../state';
import EditField from './EditField';

export default function Models() {
  // Keep a list of the state models
  const [models,] = useModels();
  const updateModel = useUpdateModel();

  return (
    <Table>
      <thead>
        <th>Model Name</th>
        <th>Image</th>
        <th>Protobuf Interface</th>
        <th>Action</th>
      </thead>
      <tbody>
        {models.map(model => <tr key={model.modelId}>
          <td><EditField value={model.name} setValue={name => updateModel({ ...model, name })} /></td>
          <td><EditField value={model.image} setValue={image => updateModel({ ...model, image })} /></td>
          <td>{model.methods.map(method => <pre>{remoteMethodToString(method)}</pre>)}</td>
          <td><Button variant='danger'><FaTrash /></Button></td>
        </tr>)}
        <ModelAddingForm />
      </tbody>
    </Table>
  );
}

function ModelAddingForm() {
  const createModel = useCreateModel();
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const filesRef = useRef<HTMLInputElement | null>(null);
  return (
    <tr>
      <td>
        <Form.Control
          placeholder='Model name'
          value={name}
          onChange={({ target: { value }}) => setName(value)}
        />
      </td>
      <td>
        <Form.Control
          placeholder='<dockerid>/reponame'
          value={image}
          onChange={({ target: { value }}) => setImage(value)}
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
          variant='primary'
          onClick={async () => {
            const inputElement = filesRef.current;
            if (inputElement) {
              createModel({
                name,
                image,
                protobufCode: await fileContent(inputElement) || ''
              });

              setName('');
              setImage('');
              inputElement.value = '';
            }
          }}
        ><FaPlus /></Button>
      </td>
    </tr>
  );
}