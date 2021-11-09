import React from 'react';
import { v4 as uuid } from 'uuid';
import { sortBy } from 'lodash';
import {
  AccessPoint,
  Drag,
  Edge,
  HasAccessPointId,
  HasEdgeId,
  HasNodeId,
  Node,
  UUID
} from '../types';
import { useEdges, useNodes } from '../state';
import {
  compatibleMethods,
  objectToColor
} from '../utils';

interface AccessPointSVGProps {
  accessPoint: AccessPoint;
  setDrag: (drag: Drag) => void;
  drag: Drag | null;
}
export default function AccessPointSVG({
  accessPoint,
  drag,
  setDrag
}: AccessPointSVGProps) {
  const [nodes ] = useNodes();
  const [edges, setEdges] = useEdges();

  // A function to add an edge connection two nodes
  const addEdge = (left: AccessPoint, right: AccessPoint) => {
    const [requester, responder] = sortBy([left, right], ap => ap.role);
    setEdges(edges.add({
      edgeId: uuid(),
      requesterId: { nodeId: requester.nodeId, accessPointId: requester.accessPointId },
      responderId: { nodeId: responder.nodeId, accessPointId: responder.accessPointId }
    }));
  };

  function findEdge({ accessPointId }: HasAccessPointId): Edge | null {
    return edges
      .find(({ requesterId, responderId }) =>
        requesterId.accessPointId === accessPointId ||
        responderId.accessPointId === accessPointId) || null;
  }

  const removeEdge = (edge: Edge) => {
    setEdges(edges.remove(edge));
  };

  const outerRadius = 12;
  const innerRadius = outerRadius / 2;
  const { x, y } = accessPoint;
  // Get the color of the object type, but don't use the name or whether it is streamed. Only
  // consider the fields
  const color = objectToColor({ ...accessPoint.type, name: null, streamed: null });
  return (
    <g
      onMouseDown={(e) => {
        const edge = findEdge(accessPoint);
        if (edge) {
          removeEdge(edge);
          const otherId =
            accessPoint.role === 'Requester' ? edge.responderId : edge.requesterId;
          const other = nodes
            .find(({ nodeId }) => otherId.nodeId === nodeId)
            ?.accessPoints
            ?.find(ap => ap.accessPointId === otherId.accessPointId);
          if (other) {
            setDrag({
              element: other,
              offset: {
                x: x - e.clientX,
                y: y - e.clientY
              },
              cursor: { x: e.clientX, y: e.clientY }
            });
          }
        } else {
          setDrag({
            element: accessPoint,
            offset: {
              x: x - e.clientX,
              y: y - e.clientY
            },
            cursor: { x: e.clientX, y: e.clientY }
          });
        }
      }}
      onMouseUp={() => {
        if (drag) {
          const { element } = drag;
          if (element.kind === 'AccessPoint' &&
              compatibleMethods(element, accessPoint)) {
            addEdge(accessPoint, element);
          }
        }
      }}
    >
      <title>{accessPoint.name}</title>
      {accessPoint.type.streamed ?
        <>{
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
          }</>
        :
        null
      }
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
        fill={accessPoint.role === 'Responder' ? color: 'white'}
        stroke='black'
      />
    </g>
  );
}