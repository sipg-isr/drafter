import React, { useRef, useState } from 'react';
import {
  Button,
  ButtonGroup,
  Form
} from 'react-bootstrap';
import { List, Set } from 'immutable';
import { v4 as uuid } from 'uuid';
import { FaCheck, FaPen, FaTimes, FaTrash } from 'react-icons/fa';
import { Model } from '../types';
import { fileContent, protobufToRemoteMethods, remoteMethodToString } from '../utils';

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
  entry: Display;
  setEntry: (entry: ModelEntry) => void;
  removeEntry: () => void;
}
function DisplayModel({ entry: { model }, setEntry, removeEntry }: DisplayModelProps) {

  return (
    <>
      <tr>
        <td>{model.name}</td>
        <td><pre>{model.image}</pre></td>
        <td>{model.methods.map(method => <pre key={`${model.modelId}-${method.name}`}>{remoteMethodToString(method)}</pre>)}</td>
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
              onClick={removeEntry}
            ><FaTrash /></Button>
          </ButtonGroup>
        </td>
      </tr>
    </>
  );

}

interface EditModelProps {
  entry: Edit;
  setEntry: (entry: ModelEntry) => void;
  removeEntry: () => void;
}

function EditModel({ entry: { model }, setEntry, removeEntry }: EditModelProps) {
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
                    kind: 'Model',
                    name,
                    image,
                    // TODO show an error message and abort if this is null
                    methods: protobufToRemoteMethods(await fileContent(filesRef!.current!) || '') || Set(),
                    modelId: model ? model.modelId : uuid()
                  }
                });
              }}><FaCheck /></Button>
            <Button
              variant='danger'
              onClick={removeEntry}
            ><FaTrash /></Button>
          </ButtonGroup>
        </td>
      </tr>
    </>
  );
}

interface ModelViewProps {
  entry: ModelEntry;
  setEntry: (entry: ModelEntry) => void;
  removeEntry: () => void;
}
export default function ModelView({ entry, setEntry, removeEntry }: ModelViewProps) {
  if (entry.kind === 'Display') {
    return <DisplayModel entry={entry} setEntry={setEntry} removeEntry={removeEntry} />;
  } else if (entry.kind === 'Edit') {
    return <EditModel entry={entry} setEntry={setEntry} removeEntry={removeEntry} />;
  } else {
    throw new Error(`Unexpected Model View State ${entry}`);
  }
}