import React, { useState } from 'react';
import {
  Col,
  Row
} from 'react-bootstrap';
import {
  List,
  Set
} from 'immutable';
import {
  Model,
  Node
} from '../types';
import Sidebar from './Sidebar';
import Graph from './Graph';
import {
  instantiateModel
} from '../utils';

interface EditorProps {
}
export default function Editor({}: EditorProps) {
  // TODO store state somewhere like localStorage or idb-keyval
  // write a custom hook to serialize / deserialize this
  return (
    <>
      <Row>
        <Col>
          <Sidebar />
        </Col>
        <Col><Graph /></Col>
      </Row>
    </>
  );
}