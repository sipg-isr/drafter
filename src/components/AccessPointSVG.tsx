import React from 'react';
import { v4 as uuid } from 'uuid';
import { sortBy } from 'lodash';
import {
  Requester,
  Responder,
  Drag,
  Edge,
  AccessPoint,
  Coordinates
} from '../types';
import { useEdges, useStages } from '../state';
import {
  compatibleMethods,
  objectToColor
} from '../utils';

const outerRadius = 12;
const innerRadius = outerRadius / 2;

interface AccessPointSVGProps {
  setDrag: (drag: Drag) => void;
  drag: Drag | null;
  location: Coordinates;
  accessPoint: AccessPoint;
}
export default function AccessPointSVG({
  accessPoint,
  location
}: AccessPointSVGProps) {
  const color = objectToColor({accessPoint});
  const { x, y } = location;

  return (
    <g>
      {accessPoint.type.streamed ?  <>{
        [1, 2].map(idx =>
          <circle
            key={idx}
            r={outerRadius}
            cx={x - idx * innerRadius / 2}
            cy={y - idx * innerRadius / 2}
            stroke='black'
            strokeWidth='1px'
            fillOpacity='0'
          />
        )
        }</> : null}
      <circle
        r={outerRadius}
        cx={x}
        cy={y}
        fill={accessPoint.role === 'Requester' ? color : 'white'}
        stroke='black'
        strokeWidth='1px'
      />
      <circle
        r={innerRadius}
        cx={x}
        cy={y}
        fill={accessPoint.role === 'Responder' ? color : 'white'}
        stroke='black'
      />
    </g>
  );
}