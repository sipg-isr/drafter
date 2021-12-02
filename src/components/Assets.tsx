import React, { useEffect, useRef, useState } from 'react';
import {
  Button,
  Form,
  Table
} from 'react-bootstrap';
import { List, Map, Set } from 'immutable';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { fileContent, remoteMethodToString, reportError } from '../utils';
import { useAssets, useCreateAsset, useUpdateAsset } from '../state';
import EditField from './EditField';

function AssetAddingForm() {
  const createAsset = useCreateAsset();
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const filesRef = useRef<HTMLInputElement | null>(null);
  return (
    <tr>
      <td>
        <Form.Control
          placeholder='Asset name'
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
              const content= await fileContent(inputElement);

              if (content.success) {
                createAsset({
                  name,
                  image,
                  protobufCode: content
                });
              } else {
                reportError(content);
              }

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

/**
 * This component lists the current Assets and allows you to modify them, delete them, or add more
 */
export default function Assets() {
  // Keep a list of the state assets
  const [assets] = useAssets();
  const updateAsset = useUpdateAsset();

  return (
    <Table>
      <thead>
        <tr>
          <th>Asset Name</th>
          <th>Image</th>
          <th>Protobuf Interface</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {assets.map(asset => <tr key={asset.assetId}>
          <td><EditField value={asset.name} setValue={name => updateAsset({ ...asset, name })} /></td>
          <td><EditField value={asset.image} setValue={image => updateAsset({ ...asset, image })} /></td>
          <td>{asset.methods.map(method => <pre key={method.remoteMethodId}>{remoteMethodToString(method)}</pre>)}</td>
          <td><Button variant='danger'><FaTrash /></Button></td>
        </tr>)}
        <AssetAddingForm />
      </tbody>
    </Table>
  );
}