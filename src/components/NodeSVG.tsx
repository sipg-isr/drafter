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
import React from 'react';

interface NodeSVGProps {
  node: Node;
  drag: Drag | null;
  setDrag: (drag: Drag) => void;
  restartSimulation: () => void;
  edges: Set<Edge>;
  addEdge: (edge: Edge) => void;
  removeEdge: (edge: Edge) => void;
}
export default function NodeSVG({
  node,
  drag,
  setDrag,
  restartSimulation,
  edges,
  addEdge,
  removeEdge
} : NodeSVGProps) {
  const { PI, max } = Math;
  const { name, x, y, accessPoints } = node;

  const displayName = truncate(name, { length: 25 });
  // The radii of the ellipse
  const rx = max(displayName.length * 5, 50);
  const ry = rx / 2;

  const interval = PI / accessPoints.size;

  accessPoints.forEach(([requester, responder], idx) => {
    [requester.x, requester.y] = ellipsePolarToCartesian(
      2 * idx * interval, rx, ry, x!, y!
    );
    [responder.x, responder.y] = ellipsePolarToCartesian(
      (2 * idx + 1) * interval, rx, ry, x!, y!
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
      {accessPoints.map(([requester, responder], idx) =>
        (
          <g key={requester.id + responder.id}>
            <AccessPointSVG
              accessPoint={requester}
              drag={drag}
              setDrag={setDrag}
              addEdge={addEdge}
              removeEdge={removeEdge}
              findEdge={() =>
                edges.findKey(edge => edge.requester === requester) || null}
              key={requester.id}
            />
            <AccessPointSVG
              accessPoint={responder}
              drag={drag}
              setDrag={setDrag}
              addEdge={addEdge}
              removeEdge={removeEdge}
              findEdge={() =>
                edges.findKey(edge => edge.responder === responder) || null}
              key={responder.id}
            />
          </g>
        )
      )}
    </g>
  );
}