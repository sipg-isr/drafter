import React, { useRef, useState } from 'react';
import {
  Button,
  Form,
} from 'react-bootstrap';
import { List, Set } from 'immutable';
import { v4 as uuid } from 'uuid';
import { Model } from '../types';
import { protobufToRemoteMethods } from '../utils';
import { FaPlus } from 'react-icons/fa';

interface EditModelProps {
  addModel: (model: Model) => void;
}
export default function EditModel({ addModel }: EditModelProps) {
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const filesRef = useRef<HTMLInputElement | null>(null);
  // A function that returns the plain-text value of the currently-uploaded file
  const fileContent: () => Promise<string | null> = async () => {
    // Get the set of files associated with the current file input
    // Note that we coerce to undefined in case of a falsy value here because the `Set`
    // constructor does not accept null.
    const files = List(filesRef?.current?.files || undefined);
    if (files) {
      // If the thing actually exists...
      // We should make sure it has exactly one file
      if (files.size === 1) {
        // We can assert-nonnull here because we know the files list has a first element
        const file = files.first()!;
        return file.text();
      } else {
        console.error(`Attempted to upload more than one protobuf file for a model. Files were [${files.map(file => file.name).join(', ')}]}`);
        return null;
      }
    } else {
      return null;
    }
  };
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
        <td>
          <Button
            variant='success'
            onClick={async () => {
              addModel({
                name,
                image,
                // TODO show an error message and abort if this is null
                methods: protobufToRemoteMethods(await fileContent() || '') || Set(),
                id: uuid()
              });
              // Clear all the fields
              setName('');
              setImage('');
              // TODO delete the file ref
            }}><FaPlus /></Button>
        </td>
      </tr>
    </>
  );
}
