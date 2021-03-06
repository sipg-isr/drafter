import React, { useRef, useState } from 'react';
import {
  Button,
  ButtonGroup,
  Form
} from 'react-bootstrap';
import { Set } from 'immutable';
import { v4 as uuid } from 'uuid';
import { FaCheck, FaPen, FaTimes, FaTrash } from 'react-icons/fa';
import { Asset } from '../types';
import { fileContent, protobufToRemoteMethods, remoteMethodToString, reportError } from '../utils';

interface Edit {
  kind: 'Edit';
  asset: Asset | null;
}

interface Display {
  kind: 'Display';
  asset: Asset;
}

export type AssetEntry = | Edit | Display;

interface DisplayAssetProps {
  entry: Display;
  setEntry: (entry: AssetEntry) => void;
  removeEntry: () => void;
}
function DisplayAsset({ entry: { asset }, setEntry, removeEntry }: DisplayAssetProps) {

  return (
    <>
      <tr>
        <td>{asset.name}</td>
        <td><pre>{asset.image}</pre></td>
        <td>{asset.methods.map(method => <pre key={`${asset.assetId}-${method.name}`}>{remoteMethodToString(method)}</pre>)}</td>
        <td style={{whiteSpace: 'nowrap'}}>
          <ButtonGroup>
            <Button
              variant='primary'
              onClick={() =>
                setEntry({
                  kind: 'Edit',
                  asset
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

interface EditAssetProps {
  entry: Edit;
  setEntry: (entry: AssetEntry) => void;
  removeEntry: () => void;
}

function EditAsset({ entry: { asset }, setEntry, removeEntry }: EditAssetProps) {
  const [name, setName] = useState(asset?.name || '');
  const [image, setImage] = useState(asset?.image || '');
  // Protobuf file input
  const filesRef = useRef<HTMLInputElement | null>(null);

  return (
    <>
      <tr>
        <td>
          <Form.Control
            placeholder='My asset name'
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
            { asset ?
              <Button
                variant='secondary'
                onClick={() => setEntry({ kind: 'Display', asset })}
              ><FaTimes /></Button> : null
            }
            <Button
              variant='success'
              onClick={async () => {
                const content = await fileContent(filesRef!.current!);
                if (typeof content === 'string') {
                  const methods = protobufToRemoteMethods(content);
                  setEntry({
                    kind: 'Display',
                    asset: {
                      kind: 'Asset',
                      name,
                      image,
                      // TODO show an error message and abort if this is null
                      methods: 'errorKind' in methods ? Set() : methods,
                      assetId: asset ? asset.assetId : uuid()
                    }
                  });
                } else {
                  reportError(content);
                }
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

interface AssetViewProps {
  entry: AssetEntry;
  setEntry: (entry: AssetEntry) => void;
  removeEntry: () => void;
}
/**
 * A component that displays a given asset and allows the user to edit it
 */
export default function AssetView({ entry, setEntry, removeEntry }: AssetViewProps) {
  if (entry.kind === 'Display') {
    return <DisplayAsset entry={entry} setEntry={setEntry} removeEntry={removeEntry} />;
  } else if (entry.kind === 'Edit') {
    return <EditAsset entry={entry} setEntry={setEntry} removeEntry={removeEntry} />;
  } else {
    throw new Error(`Unexpected Asset View State ${entry}`);
  }
}