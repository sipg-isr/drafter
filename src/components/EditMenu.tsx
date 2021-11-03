import React from 'react';
import {
  Container,
  ListGroup
} from 'react-bootstrap';

export default function EditMenu() {
  const dummy = () => {
    // TODO actually do something here
    console.log('Not yet implemented');
  };
  return (
    <Container>
      <ListGroup horizontal>
        <ListGroup.Item action onClick={dummy}>Open</ListGroup.Item>
        <ListGroup.Item action onClick={dummy}>Save</ListGroup.Item>
        <ListGroup.Item action onClick={dummy}>Export</ListGroup.Item>
      </ListGroup>
    </Container>
  );
}