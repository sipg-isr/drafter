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
import { useStore } from '../state';

interface EditorProps {
}
export default function Editor({}: EditorProps) {
  // TODO store this somewhere like localStorage or idb-keyval
  // write a custom hook to serialize / deserialize this
  const models = useStore(state => state.models);
  const nodes  = useStore(state => state.nodes);
  const setNodes = useStore(state => state.setNodes);

  return (
    <>
      <Row>
        <Col>
          <Sidebar
            models={models}
            addModelToEditor={(model: Model) => {
              const node = instantiateModel(model, model.name);
              setNodes(nodes.add(node));
            }}
            nodes={nodes}
            removeNode={(node: Node) => {
              setNodes(nodes.remove(node));
            }}
          />
        </Col>
        <Col><Graph nodes={nodes} setNodes={setNodes} /></Col>
      </Row>
    </>
  );
}