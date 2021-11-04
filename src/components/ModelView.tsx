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

export type ModelEntry = | Edit | Display;

interface DisplayModelProps {
  setEntry: (entry: ModelEntry) => void;
  removeModel: () => void;
  entry: Display;
}
function DisplayModel({ setEntry, entry: { model }, removeModel}: DisplayModelProps) {
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
                setEntry({
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
  setEntry: (entry: ModelEntry) => void;
  removeModel: () => void;
  entry: Edit;
}

function EditModel({ setEntry, entry: { model }, removeModel }: EditModelProps) {
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
                onClick={() => setEntry({ kind: 'Display', model })}
              ><FaTimes /></Button> : null
            }
            <Button
              variant='success'
              onClick={async () => {
                setEntry({
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
  setEntry: (entry: ModelEntry) => void;
  removeModel: () => void;
  entry: ModelEntry;
}
export default function ModelView({ entry, setEntry, removeModel }: ModelViewProps) {
  if (entry.kind === 'Display') {
    return <DisplayModel entry={entry} setEntry={setEntry} removeModel={removeModel} />;
  } else if (entry.kind === 'Edit') {
    return <EditModel entry={entry} setEntry={setEntry} removeModel={removeModel} />;
  } else {
    throw new Error(`Unexpected Model View State ${entry}`);
  }
}