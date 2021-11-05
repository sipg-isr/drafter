import React from 'react';
import {
  Button,
  Row,
  Table
} from 'react-bootstrap';
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

export default function Sidebar() {
  const [models] = useModels();
  const [nodes, setNodes] = useNodes();
  const removeNode = (node: Node) => setNodes(nodes.remove(node.nodeId));
  const addModelToEditor = (model: Model) => {
    const node = instantiateModel(model, model.name);
    setNodes(nodes.set(node.nodeId, node));
  }

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
            {models.toList().map(model =>
              <tr key={model.modelId}>
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
            {nodes.toList().map(node =>
              <tr key={node.nodeId}>
                <td>{node.name}</td>
                <td>{models.get(node.modelId)!.name}</td>
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