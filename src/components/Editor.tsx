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
import { Model, RemoteMethod } from '../types';
import { copyModel } from '../utils';
import { FaPlus } from 'react-icons/fa';

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

interface GraphProps {
  models: List<Model>;
  setModels: (nodes: List<Model>) => void;
};
function Graph({ models, setModels }: GraphProps) {
  const [simulation] = useState(forceSimulation<Model | RemoteMethod>().stop());

  // TODO make these configurable?
  const width = 400;
  const height = 800;

  useEffect(() => {
    const methods = models.flatMap(model => model.methods);
    simulation.nodes(models.concat(methods).toArray());
    simulation
      .force('charge', forceManyBody().strength(-200))
      .force('vertical-center', forceX(width / 2).strength(0.25))
      .force('horizontal-center', forceY(height / 2).strength(0.25))
    simulation.alpha(0.5);
    simulation.alphaTarget(0.0).restart();
    // Run this whenever a node is added or removed
    // TODO also run it when connections are made or broken
  }, [models.size]);

  simulation.on('tick', () => {
    setModels(List(models.toArray()));
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
      {models.map(model =>
        <ModelSVG key={`${model.name}-${model.x}-${model.y}`} model={model} />
      )}
      {models.flatMap(model => model.methods).map(method =>
        <RemoteMethodSVG key={`${Math.random()}`} method={method} />
      )}
    </svg>
  );
}

interface RemoteMethodSVGProps {
  method: RemoteMethod;
};
function RemoteMethodSVG({ method: { x, y } }: RemoteMethodSVGProps) {
  return (
    <circle
      r={10}
      cx={x!}
      cy={y!}
      stroke="#f00"
      strokeWidth="1px"
      fillOpacity="0"
    />
  );
};

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
      strokeWidth="1px"
      fillOpacity="0"
    />
  );
};

interface EditorProps {
  availableModels: List<Model>;
};
export default function Editor({ availableModels }: EditorProps) {
  const [models, setModels] = useState<List<Model>>(List([]));
  return (
    <>
      <Row>
        <Col xs="2">
          <Sidebar availableModels={availableModels} addModelToEditor={(model: Model) => {
            setModels(models.push(copyModel(model)))
          }} />
        </Col>
        <Col><Graph models={models} setModels={setModels} /></Col>
      </Row>
    </>
  );
};
