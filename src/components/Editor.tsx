import React, { useState } from 'react';
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceX
} from 'd3-force';
import {
  Col,
  Row,
  ListGroup,
  Button,
  Form
} from 'react-bootstrap';
import { List } from 'immutable';
import { Model } from '../types';

interface SidebarProps {
  models: List<Model>;
};
function Sidebar({ models }: SidebarProps) {
  return (
    <>
      <h6>Available models</h6>
      <ListGroup>
        {models.map(model =>
        <ListGroup.Item>{model.name}</ListGroup.Item>
        )}
      </ListGroup>
    </>
  );
}

interface GraphProps {};
function Graph() {
  return (
    <h6>Graph</h6>
  );
}

interface EditorProps {
  models: List<Model>;
};
export default function Editor({ models }: EditorProps) {
  const [text, setText] = useState('');
  return (
    <>
      <Row>
        <Col xs="2">
          <Sidebar models={models} />
        </Col>
        <Col><Graph /></Col>
      </Row>
    </>
  );
};
