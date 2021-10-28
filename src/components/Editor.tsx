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
import { List } from 'immutable';
import { Model, RemoteMethod, Direction } from '../types';
import { instantiateModel, objectToColor, ellipsePolarToCartesian } from '../utils';
import { forceParentModelAttraction } from '../forces';
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
type Drag = [number, number, Model] | null;

interface GraphProps {
  models: List<Model>;
  setModels: (nodes: List<Model>) => void;
};
function Graph({ models, setModels }: GraphProps) {
  const [simulation] = useState(forceSimulation<Model>().stop());
  const [drag, setDrag] = useState<Drag>(null);
  const [selectedMethod, selectMethod] = useState<RemoteMethod | null>(null);

  useEffect(() => {
    console.log(selectedMethod);
  }, [selectedMethod]);

  // TODO make these configurable?
  const width = 400;
  const height = 800;

  useEffect(() => {
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
            <ModelSVG
              model={model}
              selectMethod={selectMethod}
              key={`${model.name}-${model.x}-${model.y}`}
              drag={drag}
              setDrag={setDrag}
              restartSimulation={restartSimulation}
            />
      )}
    </svg>
  );
}

interface MethodSVGProps {
  method: RemoteMethod;
  cx: number;
  cy: number;
};
function MethodSVG({ method, cx, cy }: MethodSVGProps) {
  const outerRadius = 10;
  const innerRadius = 5;
  // Input -> inner color
  const innerColor = method.direction == Direction.Input ? objectToColor(method.requestType) : 'white';
  // Output -> outer color
  const outerColor = method.direction == Direction.Output ? objectToColor(method.responseType) : 'white';
  return (
    <g>
      <circle
        r={outerRadius}
        cx={cx}
        cy={cy}
        fill={outerColor}
        stroke='black'
        strokeWidth='1px'
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

interface ModelSVGProps {
  model: Model;
  selectMethod: (method: RemoteMethod) => void;
  drag: Drag;
  setDrag: (drag: Drag) => void;
  restartSimulation: () => void;
};
function ModelSVG({
  model,
  selectMethod,
  drag,
  setDrag,
  restartSimulation
} : ModelSVGProps) {
  const { PI, max } = Math;
  const { name, x, y, methods } = model;

  const displayName = truncate(name, { length: 25 });
  // The radius of the main circle
  const rx = max(displayName.length * 5, 50);
  const ry = rx / 2;
  const interval = (2 * PI) / methods.size;

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
          setDrag([x! - e.clientX, y! - e.clientY, model]);
          restartSimulation();
        }}
      />
      {methods.map((method, idx) => {
        const [cx, cy] = ellipsePolarToCartesian(
          idx * interval,
          rx, ry, x!, y!
        );
        return (
          <g
            onClick={() => {
              selectMethod(method)
            }}
            cursor="pointer"
            key={method.name + method.direction + x} // TODO make this not a hack
          >
            <MethodSVG method={method} cx={cx} cy={cy} />
          </g>
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
            setModels(models.push(instantiateModel(model)))
          }} />
        </Col>
        <Col><Graph models={models} setModels={setModels} /></Col>
      </Row>
    </>
  );
};
