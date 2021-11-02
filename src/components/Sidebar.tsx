import React from 'react';
import {
  Row,
  Button,
  Table
} from 'react-bootstrap';
import {
  List,
  Set
} from 'immutable';
import { FaPlus, FaTrash } from 'react-icons/fa';
import {
  Model,
  Node
} from '../types';

interface SidebarProps {
  models: List<Model>;
  addModelToEditor: (model: Model) => void;
  nodes: Set<Node>;
  removeNode: (node: Node) => void;
}
export default function Sidebar({
  models,
  addModelToEditor,
  nodes,
  removeNode
}: SidebarProps) {
  return (
    <>
      <Row>
        <h6>Available models</h6>
        <Table>
          <thead>
            <tr>
              <th>Model</th>
              <th>Image</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {models.map(model =>
              <tr key={model.name}>
                <td>{model.name}</td>
                <td><pre>{model.image}</pre></td>
                <td>
                  <Button onClick={() => addModelToEditor(model)}>
                    <FaPlus />
                  </Button>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Row>
      <Row>
        <h6>Nodes</h6>
        <Table>
          <thead>
            <tr>
              <th>Node</th>
              <th>Model</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {nodes.map(node =>
              <tr key={node.id}>
                <td>{node.name}</td>
                <td>{node.modelName}</td>
                <td>
                  <Button
                    variant='danger'
                    onClick={() => removeNode(node)}>
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Row>
    </>
  );
}
