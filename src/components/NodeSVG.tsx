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
  Node
} from '../types';
import {
  ellipsePolarToCartesian
} from '../utils';
import AccessPointSVG from './AccessPointSVG';

interface NodeSVGProps {
  node: Node;
  drag: Drag | null;
  setDrag: (drag: Drag) => void;
  restartSimulation: () => void;
}
export default function NodeSVG({
  node,
  drag,
  setDrag,
  restartSimulation
} : NodeSVGProps) {
  const { PI, max } = Math;
  const { name, x, y } = node;

  const displayName = truncate(name, { length: 25 });
  // The radii of the ellipse
  const rx = max(displayName.length * 6, 50);
  const ry = rx * 0.65;

  const interval = (2 * PI) / node.accessPoints.size;

  useEffect(() => {
    node
      .accessPoints
      .forEach((accessPoint, idx) => {
        [accessPoint.x, accessPoint.y] = ellipsePolarToCartesian(
          idx * interval, rx, ry, x, y
        );
      });
  }, [x, y]);


  return (
    <g>
      <ellipse
        rx={rx}
        ry={ry}
        cx={x}
        cy={y}
        fill='#fff'
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
            element: node
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
      {node.accessPoints.map(ap =>
        (
          <AccessPointSVG
            accessPoint={ap}
            drag={drag}
            setDrag={setDrag}
            key={ap.accessPointId}
          />
        )
      )}
    </g>
  );
}