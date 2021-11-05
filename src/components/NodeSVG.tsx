import React from 'react';
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
import { useAccessPoints } from '../state';
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
  restartSimulation,
} : NodeSVGProps) {
  const [accessPoints, ] = useAccessPoints();
  const { PI, max } = Math;
  const { name, x, y } = node;

  const displayName = truncate(name, { length: 25 });
  // The radii of the ellipse
  const rx = max(displayName.length * 5, 50);
  const ry = rx / 2;

  const interval = (2 * PI) / accessPoints.size;

  accessPoints
    .filter(ap => ap.nodeId === node.nodeId)
    .toList()
    .forEach((accessPoint, idx) => {
      [accessPoint.x, accessPoint.y] = ellipsePolarToCartesian(
        2 * idx * interval, rx, ry, x!, y!
      );
    });


  return (
    <g>
      <ellipse
        rx={rx}
        ry={ry}
        cx={x!}
        cy={y!}
        fill='#fff'
        stroke='#000'
        strokeWidth='1px'
        cursor={drag ? 'grabbing' : 'grab'}
        onMouseDown={(e) => {
          setDrag({
            offset: {
              x: x! - e.clientX,
              y: y! - e.clientY
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
        textAnchor='middle'
        stroke='#fff'
        strokeWidth='0.5'
        strokeOpacity='0.6'
        fill='#000'
        fontSize='16px'
        x={x!}
        y={y!}
      >{displayName}</text>
      {accessPoints.toList().map(ap =>
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