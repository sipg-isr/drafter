import React, { useEffect } from 'react';
import {
  Col,
  Row
} from 'react-bootstrap';
import {
  List,
  Set,
  is as equal
} from 'immutable';
import {
  Model,
  Node
} from '../types';
import Sidebar from './Sidebar';
import Graph from './Graph';
import { instantiateModel, lookupAccessPoint } from '../utils';
import { useEdges, useModels, useNodes } from '../state';

export default function Editor() {
  // TODO store state somewhere like localStorage or idb-keyval
  // write a custom hook to serialize / deserialize this
  const [models ] = useModels();
  const [nodes, setNodes] = useNodes();
  const [edges, setEdges] = useEdges();

  useEffect(() => {
    // Whenever the models are changed,
    // filter out only the nodes that are from these models

    setNodes(nodes
      .filter(node =>
        models.find(({ modelId }) => node.modelId === modelId))
      .map(node => {
        const model = models.find(({ modelId }) => node.modelId === modelId)!;
        if (equal(
          node.accessPoints.map(({ remoteMethodId }) => remoteMethodId).toSet(),
          model.methods.map(({ remoteMethodId }) => remoteMethodId).toSet()
        )) {
          return node;
        } else {
          return instantiateModel(model, node.name);
        }
      })
    );
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