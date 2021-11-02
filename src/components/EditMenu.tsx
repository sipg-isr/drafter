import React from 'react';
import {
  Container,
  ListGroup
} from 'react-bootstrap';

export default function EditMenu() {
  return (
    <Container>
      <ListGroup horizontal>
        <ListGroup.Item action onClick={() => {}}>Open</ListGroup.Item>
        <ListGroup.Item action>Save</ListGroup.Item>
        <ListGroup.Item action>Export</ListGroup.Item>
      </ListGroup>
    </Container>
  );
}

