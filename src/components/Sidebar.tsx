import React from 'react';
import {
  Button,
  Row,
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
import { instantiateModel } from '../utils';
import {
  useModels,
  useNodes
} from '../state';

interface SidebarProps {
}
export default function Sidebar({
}: SidebarProps) {
  const [models, setModels] = useModels();
  const [nodes, setNodes] = useNodes();
  const removeNode = (node: Node) => setNodes(nodes.remove(node));
  const addModelToEditor = (model: Model) => setNodes(nodes.add(instantiateModel(model, model.name)))

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