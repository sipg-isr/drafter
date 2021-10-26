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
  Form
} from 'react-bootstrap';
import { List } from 'immutable';
import { Model, RemoteMethod, Node, AccessPoint } from '../types';
import { FaPlus } from 'react-icons/fa';

interface SidebarProps {
  models: List<Model>;
  addNode: (model: Model) => void;
};
function Sidebar({ models, addNode }: SidebarProps) {
  return (
    <>
      <h6>Available models</h6>
      <ListGroup>
        {models.map(model =>
        <ListGroup.Item key={model.name}>
          <Button onClick={() => addNode(model)}>
            <FaPlus />&nbsp;{model.name}
          </Button>
        </ListGroup.Item>
        )}
      </ListGroup>
    </>
  );
}

interface GraphProps {
  nodes: List<Node>;
  setNodes: (nodes: List<Node>) => void;
};
function Graph({ nodes, setNodes }: GraphProps) {
  const [simulation] = useState(forceSimulation<Node | AccessPoint>().stop());

  // TODO make these configurable?
  const width = 400;
  const height = 800;

  useEffect(() => {
    const accessPoints = nodes.flatMap(node => node.accessPoints);
    simulation.nodes(nodes.concat(accessPoints).toArray());
    simulation
      .force('charge', forceManyBody().strength(-200))
      .force('vertical-center', forceX(width / 2).strength(0.25))
      .force('horizontal-center', forceY(height / 2).strength(0.25))
    simulation.alpha(0.5);
    simulation.alphaTarget(0.0).restart();
    // Run this whenever a node is added or removed
    // TODO also run it when connections are made or broken
  }, [nodes.size]);

  simulation.on('tick', () => {
    setNodes(List(nodes.toArray()));
  });

  return (
    <svg
      width={width}
      height={height}
      style={{
        border: '1px solid black'
      }}
      viewBox={`0 0 ${width} ${height}`}
    >
      {nodes.map(node =>
        <ModelSVG key={`${node.id.name}-${node.x}-${node.y}`} node={node} />
      )}
    </svg>
  );
}

interface ModelSVGProps {
  node: Node;
};
function ModelSVG({ node: { x, y} } : ModelSVGProps) {
  return (
    <circle
      r={20}
      cx={x!}
      cy={y!}
      stroke="#000"
      strokeWidth="4px"
    />
  );
};

interface EditorProps {
  models: List<Model>;
};
export default function Editor({ models }: EditorProps) {
  const [nodes, setNodes] = useState<List<Node>>(List([]));
  return (
    <>
      <Row>
        <Col xs="2">
          <Sidebar models={models} addNode={(model: Model) => {
            setNodes(nodes.push({
              id: model,
              accessPoints: model.methods.map(method => ({ id: method }))
            }))
          }} />
        </Col>
        <Col><Graph nodes={nodes} setNodes={setNodes} /></Col>
      </Row>
    </>
  );
};
