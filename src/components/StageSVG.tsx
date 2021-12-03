import React, { useEffect } from 'react';
import {
  Set
} from 'immutable';
import {
  truncate
} from 'lodash';
import {
  Drag,
  Edge,
  Stage
} from '../types';
import {
  ellipsePolarToCartesian
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
  const { PI, max } = Math;
  const { name, x, y } = stage;

  const displayName = truncate(name, { length: 25 });
  // The radii of the ellipse
  const rx = max(displayName.length * 6, 50);
  const ry = rx * 0.65;

  // const interval = (2 * PI) / stage.accessPoints.size;

  /*useEffect(() => {
    stage
      .accessPoints
      .forEach((accessPoint, idx) => {
        [accessPoint.x, accessPoint.y] = ellipsePolarToCartesian(
          idx * interval, rx, ry, x, y
        );
      });
  }, [x, y]);*/

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
        onMouseDown={(e) => {
          setDrag({
            offset: {
              x: x - e.clientX,
              y: y - e.clientY
            },
            cursor: {
              x: e.clientX, y: e.clientY
            },
            element: stage
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
      >{displayName}</text>
      {/*stage.accessPoints.map(ap =>
        (
          <AccessPointSVG
            accessPoint={ap}
            drag={drag}
            setDrag={setDrag}
            key={ap.accessPointId}
          />
        )
      )*/}
    </g>
  );
}