import React, { useEffect } from 'react';
import { v4 as uuid } from 'uuid';
import {
  Drag,
  Edge,
  Stage
} from '../types';
import {
  accessPointLocation,
  compatibleMethods,
  findStage
} from '../utils';
import {
  useDispatch,
  useStages,
  useEdges
} from '../state';
import AccessPointSVG from './AccessPointSVG';

interface StageSVGProps {
  stage: Stage;
  drag: Drag | null;
  setDrag: (drag: Drag) => void;
  restartSimulation: () => void;
}
/**
 * An SVG component for visualizing stages
 * Each stage is represented as an ellipse with its name written
 * It also has a set of colored ovals representing accessPoints around its edge
 */
export default function StageSVG({
  stage,
  drag,
  setDrag,
  restartSimulation
} : StageSVGProps) {
  const { name, x, y, rx, ry } = stage;
  const stages = useStages();
  const edges = useEdges();
  const dispatch = useDispatch();

  return (
    <g>
      <ellipse
        rx={rx}
        ry={ry}
        cx={x}
        cy={y}
        fill='#e8e8e8'
        fillOpacity='0.5'
        stroke='#000'
        strokeWidth='1px'
        cursor={drag ? 'grabbing' : 'grab'}
        onMouseDown={({clientX, clientY}) => {
          setDrag({
            offset: {
              x: x - clientX,
              y: y - clientY
            },
            cursor: {
              x: clientX, y: clientY
            },
            stage,
            dragKind: 'Stage'
          });
          restartSimulation();
        }}
      />
      <text
        pointerEvents='none'
        textAnchor='middle'
        stroke='#fff'
        strokeWidth='0.5'
        strokeOpacity='0.6'
        fill='#000'
        fontSize='16px'
        x={x}
        y={y}
      >{name}</text>
      {
        [stage.requester, stage.responder].map(accessPoint => {
          const loc = accessPointLocation(stage, accessPoint.kind)
          return <g
            key={accessPoint.kind}
            onMouseDown={({ clientX, clientY }) => {
              const edge = edges.find(({ requesterId, responderId }) =>
                accessPoint.kind === 'Requester' ?
                  requesterId === stage.stageId :
                  responderId === stage.stageId
              );
              if (edge) {
                dispatch({ type: 'DeleteEdge', edge });
                const oppositeStage = findStage(
                  stages,
                  accessPoint.kind === 'Requester' ? edge.responderId : edge.requesterId
                );
                if (oppositeStage.kind === 'Error') { throw oppositeStage; }
                setDrag({
                  offset: {
                    x: loc.x - clientX,
                    y: loc.y - clientY
                  },
                  cursor: {
                    x: clientX,
                    y: clientY
                  },
                  stage: oppositeStage,
                  dragKind: accessPoint.kind === 'Requester' ? 'Responder' : 'Requester'
                });
              } else {
                setDrag({
                  offset: {
                    x: loc.x - clientX,
                    y: loc.y - clientY
                  },
                  cursor: {
                    x: clientX,
                    y: clientY
                  },
                  stage,
                  dragKind: accessPoint.kind
                });
              }
            }}
            onMouseUp={() => {
              if (drag) {
                if (accessPoint.kind === 'Requester' &&
                    drag.dragKind === 'Responder' &&
                    compatibleMethods(accessPoint, drag.stage.responder)
                ) {
                  // Add edge
                  dispatch({
                    type: 'AddEdge',
                    edge: { edgeId: uuid(), requesterId: stage.stageId, responderId: drag.stage.stageId }
                  });
                } else if (accessPoint.kind === 'Responder' &&
                    drag.dragKind === 'Requester' &&
                    compatibleMethods(drag.stage.requester, accessPoint)
                ) {
                  // Add edge
                  dispatch({
                    type: 'AddEdge',
                    edge: { edgeId: uuid(), requesterId: drag.stage.stageId, responderId: stage.stageId }
                  });
                }
              }
            }}
        >
            <AccessPointSVG
              location={loc}
              accessPoint={accessPoint}
            />
          </g>
        })
    }
      </g>
  );
}