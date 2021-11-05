import React from 'react';
import { Map } from 'immutable';
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
import { v4 as uuid } from 'uuid';

function lookupAccessPoint(
  nodes: Map<UUID, Node>,
  { nodeId, accessPointId }: HasNodeId & HasAccessPointId
): AccessPoint | null {
  return nodes.get(nodeId)?.accessPoints.get(accessPointId) || null;
}


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
    const edgeId = uuid();
    setEdges(edges.set(edgeId, {
      edgeId,
      requesterId: { nodeId: left.nodeId, accessPointId: left.accessPointId },
      responderId: { nodeId: right.nodeId, accessPointId: right.accessPointId}
    }));
  }

  function findEdge({ accessPointId }: HasAccessPointId): Edge | null {
    return edges
      .find(edge =>
        edge.requesterId.accessPointId === accessPointId ||
        edge.responderId.accessPointId === accessPointId) || null;
  }

  const removeEdge = ({ edgeId }: HasEdgeId) => {
    setEdges(edges.remove(edgeId));
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
          const other = lookupAccessPoint(nodes, accessPoint.role === 'Requester' ? edge.responderId : edge.requesterId);
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