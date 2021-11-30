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
  Asset,
  Node
} from '../types';
import Sidebar from './Sidebar';
import Graph from './Graph';
import { instantiateAsset, lookupAccessPoint } from '../utils';
import { useEdges, useAssets, useNodes } from '../state';

export default function Editor() {
  // TODO store state somewhere like localStorage or idb-keyval
  // write a custom hook to serialize / deserialize this
  const [assets ] = useAssets();
  const [nodes, setNodes] = useNodes();
  const [edges, setEdges] = useEdges();

  useEffect(() => {
    // Whenever the assets are changed,
    // filter out only the nodes that are from these assets

    setNodes(nodes
      .filter(node =>
        assets.find(({ assetId }) => node.assetId === assetId))
      .map(node => {
        const asset = assets.find(({ assetId }) => node.assetId === assetId)!;
        if (equal(
          node.accessPoints.map(({ remoteMethodId }) => remoteMethodId).toSet(),
          asset.methods.map(({ remoteMethodId }) => remoteMethodId).toSet()
        )) {
          return node;
        } else {
          return instantiateAsset(asset, node.name);
        }
      })
    );
  }, [assets]);

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