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
import { forceParentModelAttraction } from '../forces';
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
  const [simulation] = useState(forceSimulation<Model>().stop());
  const [drag, setDrag] = useState<[number, number, Model] | null>(null);

  // TODO make these configurable?
  const width = 400;
  const height = 800;

  useEffect(() => {
    const methods = models.flatMap(model => model.methods);
    simulation.nodes(models.toArray());
    simulation
      .force('vertical-center', forceX(width / 2).strength(0.01))
      .force('horizontal-center', forceY(height / 2).strength(0.01))
      .force('charge', forceManyBody().strength(-100))
      .force('parent model attraction', forceParentModelAttraction(models, 0.1));
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
      onMouseMove={(e) => {
        if (drag) {
          const [offsetX, offsetY, node] = drag;
        node.fx! = e.clientX + offsetX;
        node.fy! = e.clientY + offsetY;
        }
      }}
      onMouseUp={() => {
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
      {models.map(model =>
          <g
            onMouseDown={(e) => {
              setDrag([model.x! - e.clientX, model.y! - e.clientY, model]);
              simulation.alphaTarget(0.3).restart();
            }}
            cursor='move'
            key={`${model.name}-${model.x}-${model.y}`}
          >
            <ModelSVG  model={model} />
          </g>
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
function ModelSVG({ model: { x, y, methods } } : ModelSVGProps) {
  // The radius of the main circle
  const radius = 40;
  const { sin, cos, PI } = Math;

  const interval = (2 * PI) / methods.size;

  return (
    <g>
      <circle
        r={radius}
        cx={x!}
        cy={y!}
        stroke="#000"
        strokeWidth="1px"
        fillOpacity="0"
      />
      {methods.map((method, idx) => {
        const angle = interval * idx;
        const [cx, cy] = [cos, sin].map(fn => radius * fn(angle));
        return (
          <RemoteMethodSVG method={{...method, x: x! + cx, y: y! + cy}}/>
        );
      })}
    </g>
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
