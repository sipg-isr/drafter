import React from 'react';
import { Map } from 'immutable';
import { v4 as uuid } from 'uuid';
import { sortBy } from 'lodash';
import {
  AccessPoint,
  HasAccessPointId,
  Drag,
  Edge,
  UUID,
  HasNodeId,
  HasEdgeId,
  Node
} from '../types';
import { useEdges, useNodes } from '../state';
import {
  objectToColor,
  compatibleMethods
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
  const [nodes, ] = useNodes();
  const [edges, setEdges] = useEdges();

  // A function to add an edge connection two nodes
  const addEdge = (left: AccessPoint, right: AccessPoint) => {
    const [requester, responder] = sortBy([left, right], ap => ap.role);
    setEdges(edges.add({
      edgeId: uuid(),
      requesterId: { nodeId: accessPoint.nodeId, accessPointId: requester.accessPointId },
      responderId: { nodeId: accessPoint.nodeId, accessPointId: responder.accessPointId }
    }));
  }

  function findEdge({ accessPointId }: HasAccessPointId): Edge | null {
    return edges
      .find(({ requesterId, responderId }) =>
        requesterId.accessPointId === accessPointId ||
        responderId.accessPointId === accessPointId) || null;
  }

  const removeEdge = (edge: Edge) => {
    setEdges(edges.remove(edge));
  }

  const outerRadius = 12;
  const innerRadius = outerRadius / 2;
  const { x, y } = accessPoint;
  const color = objectToColor(accessPoint.type);
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
            ?.find(ap => ap.accessPointId === otherId.accessPointId)
          if (other) {
            setDrag({
              element: other,
              offset: {
                x: x! - e.clientX,
                y: y! - e.clientY
              },
              cursor: { x: e.clientX, y: e.clientY }
            });
          }
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
      <circle
        r={outerRadius}
        cx={x!}
        cy={y!}
        fill={accessPoint.role === 'Requester' ? color : 'white'}
        stroke={'black'}
        strokeWidth={ '1px' }
      />
      <circle
        r={innerRadius}
        cx={x!}
        cy={y!}
        fill={accessPoint.role === 'Responder' ? color: 'white'}
      />
    </g>
  );
}