import React, { useState } from 'react';
import {
  Button,
  FloatingLabel,
  Form,
  Row,
  Table
} from 'react-bootstrap';
import { FaPlus, FaTrash } from 'react-icons/fa';
import {
  Model,
  Node,
  UUID
} from '../types';
import { instantiateModel } from '../utils';
import {
  useModels,
  useNodes
} from '../state';

export default function Sidebar() {
  const [models] = useModels();
  const [nodes, setNodes] = useNodes();
  const removeNode = (node: Node) => setNodes(nodes.remove(node));
  const addModelToEditor = (model: Model) => {
    const node = instantiateModel(model, model.name);
    setNodes(nodes.add(node));
  };

  // This is a hack-- the select element won't accept null as a value, so we define an alternate
  // null value-- nil. This hack isn't comprehensive. If the user somehow gets a UUID that is
  // equal to '0', then this will fail. However, this shouldn't happen for a UUID
  const nil = '0';
  const [selectedModelId, setSelectedModelId] = useState<UUID | typeof nil>(nil);

  return (
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
              <td>{models.find(({ modelId }) => node.modelId === modelId)?.name || 'No model found'}</td>
              <td>
                <Button
                  variant='danger'
                  onClick={() => removeNode(node)}>
                  <FaTrash />
                </Button>
              </td>
            </tr>
          )}
          <tr>
            <td colSpan={2}>
              <FloatingLabel controlId='floatingSelectGrid' label='Add model' defaultValue={nil}>
                <Form.Select aria-label='Add another model' onChange={({ target: { value } }) => setSelectedModelId(value)}>
                  <option value={nil}>Select Model to add</option>
                  {models.map(({ modelId, name }) =>
                    <option key={modelId }value={modelId}>{name}</option>
                  )}
                </Form.Select>
              </FloatingLabel>
            </td>
            <td>
              <Button
                disabled={ selectedModelId === nil }
                variant='primary'
                onClick={() => {
                  const model = models.find(({ modelId }) => modelId === selectedModelId);
                  if (model) {
                    addModelToEditor(model);
                  }
                }}
              >
                <FaPlus />
              </Button>
            </td>
          </tr>
        </tbody>
      </Table>
    </Row>
  );
}