import React, { useEffect, useReducer, useState } from 'react';
import {
  forceManyBody,
  forceSimulation,
  forceX,
  forceY
} from 'd3-force';
import {
  Drag,
  Stage
} from '../types';
import { findStage, accessPointLocation } from '../utils';
import { useEdges, useStages } from '../state';
import EdgeSVG from './EdgeSVG';
import StageSVG from './StageSVG';

/**
 * This component is the core of Drafter. It displays the network of stages and allows you to drag
 * them around, edit, or remove them
 */
export default function Graph() {
  const [simulation] = useState(forceSimulation<Stage>().stop());
  const [drag, setDrag] = useState<Drag | null>(null);
  const [stages ] = useStages();
  // TODO move these into state container
  const [edges ] = useEdges();

  const [, update] = useReducer(x => x + 1, 0);

  // TODO make these configurable?
  const width = 600;
  const height = 800;
  const initialAlpha = 0.5;
  const alphaTarget = 0;

  useEffect(() => {
    simulation.nodes(stages.valueSeq().toArray());
    simulation
      .force('vertical-center', forceX(width / 2).strength(0.01))
      .force('horizontal-center', forceY(height / 2).strength(0.01))
      .force('charge', forceManyBody().strength(-100));
    simulation.alpha(initialAlpha);
    simulation.alphaTarget(alphaTarget).restart();
  }, [stages, edges]);

  simulation.on('tick', () => {
    update();
  });

  const restartSimulation = () => {
    simulation
      .alpha(initialAlpha)
      .restart();
  };

  useEffect(() => {
    if (drag) {
      const {cursor, offset, stage, dragKind} = drag;
      if (dragKind === 'Stage') {
        stage.fx! = cursor.x + offset.x;
        stage.fy! = cursor.y + offset.y;
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
      onMouseMove={({ clientX, clientY }) => {
        if (drag) {
          setDrag({
            ...drag,
            cursor: { x: clientX, y: clientY }
          });
        }
      }}
      onMouseUp={() => {
        if (drag && drag.dragKind === 'Stage') {
          const { stage } = drag;
          stage.fx = stage.fy = null;
          setDrag(null);
          restartSimulation();
        }
      }}
      onMouseLeave={() => {
        if (drag && drag.dragKind === 'Stage') {
          const { stage } = drag;
          stage.fx = stage.fy = null;
          setDrag(null);
          restartSimulation();
        }
      }}
    >
      {edges.map(({ requesterId, responderId }) => {
        // Look up each id
        const requester = findStage(stages, requesterId.stageId)
        const responder = findStage(stages, responderId.stageId)
        if (requester.kind !== 'Error' &&
            responder.kind !== 'Error') {
          return <EdgeSVG
            key={`edge-${requester.stageId}-${responder.stageId}`}
            origin={requester}
            destination={responder}
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
            stage,
            dragKind
          } = drag;
          if (dragKind !== 'Stage') {
            const eloc = accessPointLocation(stage, dragKind);
            return <EdgeSVG
              origin={eloc}
              destination={{
                x: cursor.x + offset.x,
                y: cursor.y + offset.y
              }}
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