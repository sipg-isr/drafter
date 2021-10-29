import React, { useState, useEffect } from 'react';
import {
  forceSimulation,
  forceManyBody,
  forceX,
  forceY
} from 'd3-force';
import {
  Col,
  Row,
} from 'react-bootstrap';
import {
  List,
  Set,
} from 'immutable';
import { truncate } from 'lodash'
import {
  Model,
  Node,
  AccessPoint,
  Edge
} from '../types';
import Sidebar from './Sidebar';
import {
  instantiateModel,
  objectToColor,
  ellipsePolarToCartesian,
  compatibleMethods
} from '../utils';

interface EdgeSVGProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}
function EdgeSVG({
  x1, x2, y1, y2
}: EdgeSVGProps) {
  return <line
    x1={x1}
    y1={y1}
    x2={x2}
    y2={y2}
    stroke='#999'
    strokeOpacity='0.6'
    strokeWidth='10'
  />
}

/**
 * Represents a model that is being dragged and its coordinates, or a lack of drag
 */
interface Coordinates {
  x: number;
  y: number;
};
interface Drag {
  offset: Coordinates;
  cursor: Coordinates;
  element: Node | AccessPoint;
}

interface GraphProps {
  nodes: Set<Node>;
  setNodes: (nodes: Set<Node>) => void;
};
function Graph({ nodes, setNodes }: GraphProps) {
  const [simulation] = useState(forceSimulation<Node>().stop());
  const [drag, setDrag] = useState<Drag | null>(null);
  const [edges, setEdges] = useState<Set<Edge>>(Set());

  // TODO make these configurable?
  const width = 400;
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

interface AccessPointSVGProps {
  accessPoint: AccessPoint;
  setDrag: (drag: Drag) => void;
  drag: Drag | null;
  addEdge: (edge: Edge) => void;
  removeEdge: (edge: Edge) => void;
  findEdge: () => Edge | null;
};
function AccessPointSVG({
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
            })
          } else if ('responseType' in element && 'requestType' in accessPoint) {
            addEdge({
              requester: accessPoint,
              responder: element
            });
          }
        }
      }}
    >
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
};

interface NodeSVGProps {
  node: Node;
  drag: Drag | null;
  setDrag: (drag: Drag) => void;
  restartSimulation: () => void;
  edges: Set<Edge>;
  addEdge: (edge: Edge) => void;
  removeEdge: (edge: Edge) => void;
};
function NodeSVG({
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
      <ellipse
        rx={rx}
        ry={ry}
        cx={x!}
        cy={y!}
        stroke="#000"
        strokeWidth="1px"
        fillOpacity="0"
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
};

/**
 * An edge in the graph
 */
type Connection = [AccessPoint, AccessPoint];
interface EditorProps {
  models: List<Model>;
};
export default function Editor({ models }: EditorProps) {
  const [nodes, setNodes] = useState<Set<Node>>(Set());
  const [connections, setConnections] = useState<List<Connection>>(List());

  return (
    <>
      <Row>
        <Col xs="4">
          <Sidebar
            models={models}
            addModelToEditor={(model: Model) => {
              const node = instantiateModel(model, model.name)
              setNodes(nodes.add(node))
            }}
            nodes={nodes}
            removeNode={(node: Node) => {
              setNodes(nodes.remove(node))
            }}
          />
        </Col>
        <Col><Graph nodes={nodes} setNodes={setNodes} /></Col>
      </Row>
    </>
  );
};
