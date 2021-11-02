import React, { useState } from 'react';
import {
  Col,
  Row,
} from 'react-bootstrap';
import {
  List,
  Set,
} from 'immutable';
import {
  Model,
  Node,
} from '../types';
import Sidebar from './Sidebar';
import Graph from './Graph';
import {
  instantiateModel,
} from '../utils';

interface EditorProps {
  models: List<Model>;
};
export default function Editor({ models }: EditorProps) {
  const [nodes, setNodes] = useState<Set<Node>>(Set());

  return (
    <>
      <Row>
        <Col>
          <Sidebar
            models={models}
            addModelToEditor={(model: Model) => {
              const node = instantiateModel(model, model.name)
              setNodes(nodes.add(node))
            }}
            nodes={nodes}
            removeNode={(node: Node) => {
              setNodes(nodes.remove(node))
            }}
          />
        </Col>
        <Col><Graph nodes={nodes} setNodes={setNodes} /></Col>
      </Row>
    </>
  );
};
