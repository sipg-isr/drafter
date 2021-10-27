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
import { copyModel, objectToColor, ellipsePolarToCartesian } from '../utils';
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

interface InputSVGProps {
  method: RemoteMethod;
  cx: number;
  cy: number;
};
function InputSVG({ method, cx, cy }: InputSVGProps) {
  const outerRadius = 10;
  const innerRadius = 5;
  const inputColor = objectToColor(method.requestType);
  return (
    <g>
      <circle
        r={outerRadius}
        cx={cx}
        cy={cy}
        fill='white'
        stroke='black'
        strokeWidth='1px'
      />
      <circle
        r={innerRadius}
        cx={cx}
        cy={cy}
        fill={inputColor}
      />
    </g>
  );
};

interface OutputSVGProps {
  method: RemoteMethod;
  cx: number;
  cy: number;
};
function OutputSVG({ method, cx, cy }: OutputSVGProps) {
  const outerRadius = 10;
  const innerRadius = 5;
  const outputColor = objectToColor(method.responseType);
  return (
    <g>
      <circle
        r={outerRadius}
        cx={cx}
        cy={cy}
        fill={outputColor}
        stroke='black'
        strokeWidth='1px'
      />
      <circle
        r={innerRadius}
        cx={cx}
        cy={cy}
        fill="white"
      />
    </g>
  );
};

interface ModelSVGProps {
  model: Model;
};
function ModelSVG({ model: { name, x, y, methods } } : ModelSVGProps) {
  const { PI, max } = Math;

  const displayName = truncate(name, { length: 25 });
  // The radius of the main circle
  const rx = max(displayName.length * 5, 50);
  const ry = rx / 2;
  const interval = PI / methods.size;

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
      />
      {methods.map((method, idx) => {
        const [ix, iy] = ellipsePolarToCartesian(
          2 * idx * interval,
          rx, ry, x!, y!
        );
        const [ox, oy] = ellipsePolarToCartesian(
          (2 * idx + 1) * interval,
          rx, ry, x!, y!
        );
        return (
          <>
            <InputSVG method={method} cx={ix} cy={iy} />
            <OutputSVG method={method} cx={ox} cy={oy} />
          </>
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
