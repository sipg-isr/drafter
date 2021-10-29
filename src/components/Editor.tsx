import React, { useState, useEffect } from 'react';
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceX,
  forceY
} from 'd3-force';
import {
  Col,
  Row,
  ListGroup,
  Button,
} from 'react-bootstrap';
import {
  List,
  Set,
} from 'immutable';
import {
  Model,
  RemoteMethod,
  Node,
  AccessPoint,
} from '../types';
import {
  instantiateModel,
  objectToColor,
  ellipsePolarToCartesian,
  compatibleMethods
} from '../utils';
import { FaPlus } from 'react-icons/fa';
import { truncate } from 'lodash'

interface SidebarProps {
  availableModels: List<Model>;
  addModelToEditor: (model: Model) => void;
};
function Sidebar({ availableModels, addModelToEditor }: SidebarProps) {
  return (
    <>
      <h6>Available models</h6>
      <ListGroup>
        {availableModels.map(model =>
        <ListGroup.Item key={model.name}>
          <Button onClick={() => addModelToEditor(model)}>
            <FaPlus />&nbsp;{model.name}
          </Button>
        </ListGroup.Item>
        )}
      </ListGroup>
    </>
  );
}

/**
 * Represents a model that is being dragged and its coordinates, or a lack of drag
 */
type Drag = [number, number, Node] | null;

interface GraphProps {
  nodes: Set<Node>;
  setNodes: (nodes: Set<Node>) => void;
};
function Graph({ nodes, setNodes }: GraphProps) {
  const [simulation] = useState(forceSimulation<Node>().stop());
  const [drag, setDrag] = useState<Drag>(null);
  const [selectedMethod, selectMethod] = useState<RemoteMethod | null>(null);

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
    nodes.forEach(({x, y}) => {
    });
    setNodes(Set(nodes.toArray()));
  });

  const restartSimulation = () => {
    simulation.alphaTarget(0.3).restart();
  };

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
          const [offsetX, offsetY, node] = drag;
        node.fx! = e.clientX + offsetX;
        node.fy! = e.clientY + offsetY;
        }
      }}
      onMouseUp={(e) => {
        if (drag) {
          const [, , node] = drag;
          node.fx = node.fy = null;
          setDrag(null);
          simulation.alphaTarget(0);
        }
      }}
      onMouseLeave={() => {
        if (drag) {
          const [, , node] = drag;
          node.fx = node.fy = null;
          setDrag(null);
          simulation.alphaTarget(0);
        }
      }}
    >
      {nodes.map(node =>
            <NodeSVG
              node={node}
              key={`${node.name}-${node.modelName}`}
              drag={drag}
              setDrag={setDrag}
              restartSimulation={restartSimulation}
            />
      )}
    </svg>
  );
}

type Coordinates = [number, number];
interface AccessPointSVGProps {
  accessPoint: AccessPoint;
  center: Coordinates;
};
function AccessPointSVG({ accessPoint, center: [cx, cy] }: AccessPointSVGProps) {
  const outerRadius = 12;
  const innerRadius = outerRadius / 2;
  // Input -> inner color
  const innerColor = 'requestType' in accessPoint ? objectToColor(accessPoint.requestType) : 'white';
  // Output -> outer color
  const outerColor = 'responseType' in accessPoint ? objectToColor(accessPoint.responseType) : 'white';
  return (
    <g>
      <circle
        r={outerRadius}
        cx={cx}
        cy={cy}
        fill={outerColor}
        stroke={'black'}
        strokeWidth={ '1px' }
      />
      <circle
        r={innerRadius}
        cx={cx}
        cy={cy}
        fill={innerColor}
      />
    </g>
  );
};

interface NodeSVGProps {
  node: Node;
  drag: Drag;
  setDrag: (drag: Drag) => void;
  restartSimulation: () => void;
};
function NodeSVG({
  node,
  drag,
  setDrag,
  restartSimulation
} : NodeSVGProps) {
  const { PI, max } = Math;
  const { name, x, y, accessPoints } = node;

  const displayName = truncate(name, { length: 25 });
  // The radius of the main circle
  const rx = max(displayName.length * 5, 50);
  const ry = rx / 2;
  const interval = PI / accessPoints.size;

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
          setDrag([x! - e.clientX, y! - e.clientY, node]);
          restartSimulation();
        }}
      />
      {accessPoints.map(([input, output], idx) =>
        (
          <>
            <AccessPointSVG
              accessPoint={input}
              center={ellipsePolarToCartesian(
                2 * idx * interval, rx, ry, x!, y!
              )}
            />
            <AccessPointSVG
              accessPoint={output}
              center={ellipsePolarToCartesian(
                (2 * idx + 1) * interval, rx, ry, x!, y!
              )}
            />
          </>
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
        <Col xs="2">
          <Sidebar availableModels={models} addModelToEditor={(model: Model) => {
            const node = instantiateModel(model, model.name)
            setNodes(nodes.add(node))
          }} />
        </Col>
        <Col><Graph nodes={nodes} setNodes={setNodes} /></Col>
      </Row>
    </>
  );
};
