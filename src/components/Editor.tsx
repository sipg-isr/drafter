import React from 'react';
import {
  Col,
  Row
} from 'react-bootstrap';
import Sidebar from './Sidebar';
import Graph from './Graph';

/**
 * This component contains all functionality for adding, removing, and editing stages.
 * It contains the Sidebar and the Graph.
 */
export default function Editor() {
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