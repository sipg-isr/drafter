import React from 'react';
import {
  AccessPoint,
  Drag,
  Edge
} from '../types';
import {
  objectToColor
} from '../utils';

interface AccessPointSVGProps {
  accessPoint: AccessPoint;
  setDrag: (drag: Drag) => void;
  drag: Drag | null;
  addEdge: (edge: Edge) => void;
  removeEdge: (edge: Edge) => void;
  findEdge: () => Edge | null;
}
export default function AccessPointSVG({
  accessPoint,
  drag,
  setDrag,
  addEdge,
  removeEdge,
  findEdge
}: AccessPointSVGProps) {
  const outerRadius = 12;
  const innerRadius = outerRadius / 2;
  const { x, y } = accessPoint;
  // Requester -> inner color
  const innerColor = 'requestType' in accessPoint ? objectToColor(accessPoint.requestType) : 'white';
  // Responder -> outer color
  const outerColor = 'responseType' in accessPoint ? objectToColor(accessPoint.responseType) : 'white';
  return (
    <g
      onMouseDown={(e) => {
        const edge = findEdge();
        if (edge) {
          removeEdge(edge);
          const otherAp = edge.requester === accessPoint ? edge.responder : edge.requester;
          setDrag({
            element: otherAp,
            offset: {
              x: x! - e.clientX,
              y: y! - e.clientY
            },
            cursor: { x: e.clientX, y: e.clientY }
          });
        } else {
          setDrag({
            element: accessPoint,
            offset: {
              x: x! - e.clientX,
              y: y! - e.clientY
            },
            cursor: { x: e.clientX, y: e.clientY }
          });
        }
      }}
      onMouseUp={(e) => {
        if (drag) {
          const { element } = drag;
          if ('requestType' in element && 'responseType' in accessPoint) {
            addEdge({
              requester: element,
              responder: accessPoint
            });
          } else if ('responseType' in element && 'requestType' in accessPoint) {
            addEdge({
              requester: accessPoint,
              responder: element
            });
          }
        }
      }}
    >
      <title>{accessPoint.name}</title>
      <circle
        r={outerRadius}
        cx={x!}
        cy={y!}
        fill={outerColor}
        stroke={'black'}
        strokeWidth={ '1px' }
      />
      <circle
        r={innerRadius}
        cx={x!}
        cy={y!}
        fill={innerColor}
      />
    </g>
  );
}