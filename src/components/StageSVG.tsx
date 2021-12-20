import React, { useEffect } from 'react';
import {
  Set
} from 'immutable';
import {
  Drag,
  Edge,
  Stage
} from '../types';
import {
  accessPointLocation
} from '../utils';
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
  const { PI } = Math;
  const { name, x, y, rx, ry } = stage;

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
    <g
        onMouseDown={({ clientX, clientY }) => {
          setDrag({
            offset: {
              x: x - clientX,
              y: y - clientY
            },
            cursor: {
              x: clientX,
              y: clientY
            },
            stage,
            dragKind: 'Requester'
          })
        }}
    >
      <AccessPointSVG
        location={accessPointLocation(stage, 'Requester')}
        accessPoint={stage.requester}
      />
    </g>
    <g
        onMouseDown={({ clientX, clientY }) => {
          setDrag({
            offset: {
              x: x - clientX,
              y: y - clientY
            },
            cursor: {
              x: clientX,
              y: clientY
            },
            stage,
            dragKind: 'Responder'
          })
        }}
    >
      <AccessPointSVG
        location={accessPointLocation(stage, 'Responder')}
        accessPoint={stage.responder}
      />
    </g>
    </g>
  );
}