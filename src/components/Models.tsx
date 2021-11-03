import React from 'react';
import {
  Button,
  Table
} from 'react-bootstrap';
import { List } from 'immutable';
import { FaPlus } from 'react-icons/fa';
// Import types
import { Model } from '../types';
import { remoteMethodToString } from '../utils';
import ModelView, { ModelViewState } from './ModelView';

interface ModelsProps {
  models: List<ModelViewState>;
  setModels: (models: List<ModelViewState>) => void;
}
export default function Models({ models, setModels }: ModelsProps) {
  const addModel = (model: ModelViewState) => setModels(models.push(model));
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
          {models.map((model, idx) => <ModelView
            key={`mv-${idx}`}
            state={model}
            removeModel={() => {
              setModels(models.remove(models.indexOf(model)));
            }}
            setState={state => setModels(models.set(idx, state))}
          />)}
          <tr>
            <td colSpan={4} style={{textAlign: 'center'}}>
              <Button
                variant='primary'
                onClick={() => addModel({ kind: 'Edit', model: null})}
              ><FaPlus /></Button>
            </td>
          </tr>
        </tbody>
      </Table>
    </>
  );
}

FileList;