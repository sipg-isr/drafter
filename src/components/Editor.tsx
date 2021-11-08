import React, { useEffect } from 'react';
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
import { lookupAccessPoint } from '../utils';
import { useEdges, useModels, useNodes } from '../state';

export default function Editor() {
  // TODO store state somewhere like localStorage or idb-keyval
  // write a custom hook to serialize / deserialize this
  const [models, ] = useModels();
  const [nodes, setNodes] = useNodes();
  const [edges, setEdges] = useEdges();

  useEffect(() => {
    // Whenever the models are changed,
    // filter out only the nodes that are from these models
    const newNodes = nodes.filter(node =>
      models.find(({ modelId }) => node.modelId === modelId));
    setNodes(newNodes);
  }, [models]);

  useEffect(() => {
    // Whenever the nodes are changed, keep only the edges with surviving points
    setEdges(edges.filter(({ requesterId, responderId }) =>
      lookupAccessPoint(nodes, requesterId) !== null &&
      lookupAccessPoint(nodes, responderId) !== null));
  }, [nodes]);

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