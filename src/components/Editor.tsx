import React, { useState, useEffect } from 'react';
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceX
} from 'd3-force';
import {
  Col,
  Row,
  ListGroup,
  Button,
  Form
} from 'react-bootstrap';
import { List } from 'immutable';
import { Model, RemoteMethod } from '../types';
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
  nodes: List<Model>;
  setNodes: (nodes: List<Model>) => void;
};
function Graph({ nodes, setNodes }: GraphProps) {
  const [simulation] = useState(forceSimulation<Model | RemoteMethod>().stop());
  // TODO make these configurable?
  const width = 400;
  const height = 800;

  useEffect(() => {
    const methods = nodes.flatMap(node => node.methods);
    console.log(nodes, methods);
    simulation.nodes(nodes.concat(methods).toArray());
    simulation.force('charge', forceManyBody().strength(-2000));
    // simulation.alpha(1);
    simulation.alphaTarget(0.0).restart();
  }, [nodes]);

  simulation.on('tick', () => {
    setNodes(List(nodes));
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
      {nodes.map(cn => <ModelSVG model={cn} />)}
    </svg>
  );
}

interface ModelSVGProps {
  model: Model;
};
function ModelSVG({ model: { x, y} } : ModelSVGProps) {
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
  const [nodes, setNodes] = useState<List<Model>>(List([{
    name: 'hello',
    image: 'none',
    methods: []
  }]));
  return (
    <>
      <Row>
        <Col xs="2">
          <Sidebar models={models} addNode={(node: Model) => {
            setNodes(nodes.push(node))
          }} />
        </Col>
        <Col><Graph nodes={nodes} setNodes={setNodes} /></Col>
      </Row>
    </>
  );
};
