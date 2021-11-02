import React, { useEffect, useState } from 'react';
import {
  forceSimulation,
  forceManyBody,
  forceX,
  forceY
} from 'd3-force';
import {
  Set
} from 'immutable';
import {
  Node,
  Edge,
  Drag
} from '../types';
import EdgeSVG from './EdgeSVG';
import NodeSVG from './NodeSVG';

interface GraphProps {
  nodes: Set<Node>;
  setNodes: (nodes: Set<Node>) => void;
};
export default function Graph({ nodes, setNodes }: GraphProps) {
  const [simulation] = useState(forceSimulation<Node>().stop());
  const [drag, setDrag] = useState<Drag | null>(null);
  const [edges, setEdges] = useState<Set<Edge>>(Set());

  // TODO make these configurable?
  const width = 600;
  const height = 800;

  useEffect(() => {
    simulation.nodes(nodes.toArray());
    simulation
      .force('vertical-center', forceX(width / 2).strength(0.01))
      .force('horizontal-center', forceY(height / 2).strength(0.01))
      .force('charge', forceManyBody().strength(-100))
    simulation.alpha(0.5);
    simulation.alphaTarget(0.0).restart();
    // Run this whenever a node is added or removed
    // TODO also run it when connections are made or broken
  }, [nodes.size]);

  simulation.on('tick', () => {
    setNodes(Set(nodes.toArray()));
  });

  const restartSimulation = () => {
    simulation.alphaTarget(0.3).restart();
  };

  useEffect(() => {
    if (drag) {
      const {cursor, offset, element} = drag;
      if ('image' in element) {
        element.fx! = cursor.x + offset.x;
        element.fy! = cursor.y + offset.y;
      }
    }
  }, [drag]);
  return (
    <svg
      width={width}
      height={height}
      style={{
        border: '1px solid black'
      }}
      viewBox={`0 0 ${width} ${height}`}
      onMouseMove={(e) => {
        if (drag) {
          setDrag({
            ...drag,
            cursor: { x: e.clientX, y: e.clientY }
          })
        };
      }}
      onMouseUp={() => {
        if (drag) {
          const { element } = drag;
          element.fx = element.fy = null;
          setDrag(null);
          restartSimulation();
        }
      }}
      onMouseLeave={() => {
        if (drag) {
          const { element } = drag;
          element.fx = element.fy = null;
          setDrag(null);
          restartSimulation();
        }
      }}
    >
      {edges.map(({ requester, responder }) =>
      <EdgeSVG
        x1={requester.x!}
        y1={requester.y!}
        x2={responder.x!}
        y2={responder.y!}
      />
      )}
      {(() => {
        if (drag) {
          const {
            offset,
            cursor,
            element
          } = drag;
          if ('requestType' in element || 'responseType' in element) {
            return <EdgeSVG
              x1={element.x!}
              y1={element.y!}
              x2={cursor.x + offset.x}
              y2={cursor.y + offset.y}
            />
          }
        }})()}
      {nodes.map(node => <NodeSVG
        node={node}
        key={node.id}
        drag={drag}
        setDrag={setDrag}
        edges={edges}
        addEdge={(edge: Edge) => setEdges(edges.add(edge))}
        removeEdge={(edge: Edge) => setEdges(edges.remove(edge))}
        restartSimulation={restartSimulation}
      />)}
    </svg>
  );
}
