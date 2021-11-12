import React, { useEffect, useState, useRef } from 'react';
import {
  Button,
  Table,
  Form
} from 'react-bootstrap';
import { List, Map, Set } from 'immutable';
import { FaTrash, FaPlus } from 'react-icons/fa';
import ModelView, { ModelEntry } from './ModelView';
import { remoteMethodToString, fileContent } from '../utils';
import { useModels, useCreateModel } from '../state';

export default function Models() {
  // Keep a list of the state models
  const [models,] = useModels();
  const createModel = useCreateModel();

  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const filesRef = useRef<HTMLInputElement | null>(null);

  return (
    <Table>
      <thead>
        <th>Name</th>
        <th>Model</th>
        <th>Protobuf Interface</th>
        <th>Action</th>
      </thead>
      <tbody>
        {models.map(({ name, image, methods, modelId }) => <tr key={modelId}>
          <td>{name}</td>
          <td>{image}</td>
          <td>{methods.map(method => <pre>{remoteMethodToString(method)}</pre>)}</td>
          <td><Button variant='danger'><FaTrash /></Button></td>
        </tr>)}
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
      </tbody>
    </Table>
  );
}