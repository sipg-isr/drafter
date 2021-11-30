import React, { useEffect, useReducer, useState } from 'react';
import {
  forceManyBody,
  forceSimulation,
  forceX,
  forceY
} from 'd3-force';
import {
  Map
} from 'immutable';
import {
  Drag,
  Edge,
  Stage
} from '../types';
import { lookupAccessPoint } from '../utils';
import { useEdges, useStages } from '../state';
import EdgeSVG from './EdgeSVG';
import StageSVG from './StageSVG';

export default function Graph() {
  const [simulation] = useState(forceSimulation<Stage>().stop());
  const [drag, setDrag] = useState<Drag | null>(null);
  const [stages, setStages] = useStages();
  // TODO move these into state container
  const [edges, setEdges] = useEdges();

  const [, update] = useReducer(x => x + 1, 0);

  // TODO make these configurable?
  const width = 600;
  const height = 800;

  useEffect(() => {
    simulation.nodes(stages.valueSeq().toArray());
    simulation
      .force('vertical-center', forceX(width / 2).strength(0.01))
      .force('horizontal-center', forceY(height / 2).strength(0.01))
      .force('charge', forceManyBody().strength(-100));
    simulation.alpha(0.5);
    simulation.alphaTarget(0.0).restart();
  }, [stages, edges]);

  simulation.on('tick', () => {
    update();
  });

  const restartSimulation = () => {
    simulation.alphaTarget(0.3).restart();
  };

  useEffect(() => {
    if (drag) {
      const {cursor, offset, element} = drag;
      if (element.kind === 'Stage') {
        element.fx! = cursor.x + offset.x;
        element.fy! = cursor.y + offset.y;
      }
    }
  }, [drag]);
  return (
    <svg
      width={width}
      height={height}
      style={{
        border: '1px solid black'
      }}
      viewBox={`0 0 ${width} ${height}`}
      onMouseMove={(e) => {
        if (drag) {
          setDrag({
            ...drag,
            cursor: { x: e.clientX, y: e.clientY }
          });
        }
      }}
      onMouseUp={() => {
        if (drag) {
          const { element } = drag;
          element.fx = element.fy = null;
          setDrag(null);
          restartSimulation();
        }
      }}
      onMouseLeave={() => {
        if (drag) {
          const { element } = drag;
          element.fx = element.fy = null;
          setDrag(null);
          restartSimulation();
        }
      }}
    >
      {edges.map(({ requesterId, responderId }) => {
        // Look up each id
        const [requesterResult, responderResult] = [requesterId, responderId]
          .map(id => lookupAccessPoint(stages, id));
        if (requesterResult.kind === 'Success' && responderResult.kind === 'Success') {
          const requester = requesterResult.value;
          const responder = responderResult.value;
          return <EdgeSVG
            key={`edge-${requester.accessPointId}-${responder.accessPointId}`}
            x1={requester.x}
            y1={requester.y}
            x2={responder.x}
            y2={responder.y}
          />;
        } else {
          return null;
        }
      })}
      {(() => {
        if (drag) {
          const {
            offset,
            cursor,
            element
          } = drag;
          if (element.kind === 'AccessPoint') {
            return <EdgeSVG
              x1={element.x!}
              y1={element.y!}
              x2={cursor.x + offset.x}
              y2={cursor.y + offset.y}
            />;
          }
        }})()}
      {stages.valueSeq().map(stage => <StageSVG
        stage={stage}
        key={stage.stageId}
        drag={drag}
        setDrag={setDrag}
        restartSimulation={restartSimulation}
      />)}

    </svg>
  );
}