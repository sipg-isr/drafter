import React, { useRef, useState } from 'react';
import {
  Button,
  ButtonGroup,
  Form
} from 'react-bootstrap';
import { List, Set } from 'immutable';
import { v4 as uuid } from 'uuid';
import { Model } from '../types';
import { fileContent, protobufToRemoteMethods, remoteMethodToString } from '../utils';
import { FaCheck, FaPen, FaTimes, FaTrash } from 'react-icons/fa';

interface Edit {
  kind: 'Edit';
  model: Model | null;
}

interface Display {
  kind: 'Display';
  model: Model;
}

export type ModelViewState = | Edit | Display;

interface DisplayModelProps {
  setState: (state: ModelViewState) => void;
  removeModel: () => void;
  state: Display;
}
function DisplayModel({ setState, state: { model }, removeModel}: DisplayModelProps) {
  return (
    <>
      <tr>
        <td>{model.name}</td>
        <td>{model.image}</td>
        <td>{model.methods.map(method => <pre key={`${model.id}-${method.name}`}>{remoteMethodToString(method)}</pre>)}</td>
        <td style={{whiteSpace: 'nowrap'}}>
          <ButtonGroup>
            <Button
              variant='primary'
              onClick={() =>
                setState({
                  kind: 'Edit',
                  model
                })
              }
            ><FaPen /></Button>
            <Button
              variant='danger'
              onClick={removeModel}
            ><FaTrash /></Button>
          </ButtonGroup>
        </td>
      </tr>
    </>
  );

}

interface EditModelProps {
  setState: (state: ModelViewState) => void;
  removeModel: () => void;
  state: Edit;
}

function EditModel({ setState, state: { model }, removeModel }: EditModelProps) {
  const [name, setName] = useState(model?.name || '');
  const [image, setImage] = useState(model?.image || '');
  // Protobuf file input
  const filesRef = useRef<HTMLInputElement | null>(null);
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
        <td style={{whiteSpace: 'nowrap'}}>
          <ButtonGroup>
            { model ?
              <Button
                variant='secondary'
                onClick={() => setState({ kind: 'Display', model })}
              ><FaTimes /></Button> : null
            }
            <Button
              variant='success'
              onClick={async () => {
                setState({
                  kind: 'Display',
                  model: {
                    name,
                    image,
                    // TODO show an error message and abort if this is null
                    methods: protobufToRemoteMethods(await fileContent(filesRef!.current!) || '') || Set(),
                    id: uuid()
                  }
                });
              }}><FaCheck /></Button>
            <Button
              variant='danger'
              onClick={removeModel}
            ><FaTrash /></Button>
          </ButtonGroup>
        </td>
      </tr>
    </>
  );
}

interface ModelViewProps {
  setState: (state: ModelViewState) => void;
  removeModel: () => void;
  state: ModelViewState;
}
export default function ModelView({ state, setState, removeModel }: ModelViewProps) {
  if (state.kind === 'Display') {
    return <DisplayModel state={state} setState={setState} removeModel={removeModel} />;
  } else if (state.kind === 'Edit') {
    return <EditModel state={state} setState={setState} removeModel={removeModel} />;
  } else {
    throw new Error(`Unexpected Model View State ${state}`);
  }
}