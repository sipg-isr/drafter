import React from 'react';
import {
  Container,
  ListGroup
} from 'react-bootstrap';
import { useStore, State } from '../state';
import { serializeState } from  '../utils';
import { saveAs } from 'file-saver';

export default function EditMenu() {
  const dummy = () => {
    // TODO actually do something here
    console.log('Not yet implemented');
  };
  const store = useStore();
  return (
    <Container>
      <ListGroup horizontal>
        <ListGroup.Item action onClick={dummy}>Open</ListGroup.Item>
        <ListGroup.Item action onClick={() =>
          saveAs(new Blob([serializeState(store)]), 'save.json')
        }>Save</ListGroup.Item>
        <ListGroup.Item action onClick={dummy}>Export</ListGroup.Item>
      </ListGroup>
    </Container>
  );
}