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
  Stage
} from '../types';
import Sidebar from './Sidebar';
import Graph from './Graph';
import { instantiateAsset, lookupAccessPoint } from '../utils';
import { useAssets, useEdges, useStages } from '../state';

/**
 * This component contains all functionality for adding, removing, and editing stages.
 * It contains the Sidebar and the Graph.
 */
export default function Editor() {
  // TODO store state somewhere like localStorage or idb-keyval
  // write a custom hook to serialize / deserialize this
  const [assets ] = useAssets();
  const [stages, setStages] = useStages();
  const [edges, setEdges] = useEdges();

  useEffect(() => {
    // Whenever the assets are changed,
    // filter out only the stages that are from these assets

    setStages(stages
      .filter(stage =>
        assets.find(({ assetId }) => stage.assetId === assetId))
      .map(stage => {
        const asset = assets.find(({ assetId }) => stage.assetId === assetId)!;
        if (equal(
          stage.accessPoints.map(({ remoteMethodId }) => remoteMethodId).toSet(),
          asset.methods.map(({ remoteMethodId }) => remoteMethodId).toSet()
        )) {
          return stage;
        } else {
          return instantiateAsset(asset, stage.name);
        }
      })
    );
  }, [assets]);

  useEffect(() => {
    // Whenever the stages are changed, keep only the edges with surviving points
    setEdges(edges.filter(({ requesterId, responderId }) =>
      lookupAccessPoint(stages, requesterId) !== null &&
      lookupAccessPoint(stages, responderId) !== null));
  }, [stages]);

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