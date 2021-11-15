import React, { useEffect, useState } from 'react';
import {
  Button,
  ButtonGroup,
  Col,
  FloatingLabel,
  Form,
  Row,
  Table
} from 'react-bootstrap';
import { FaCheck, FaPlus, FaTrash, FaEllipsisH } from 'react-icons/fa';
import {
  Model,
  Node,
  UUID
} from '../types';
import { instantiateModel } from '../utils';
import {
  useModels,
  useNodes,
  useUpdateNode
} from '../state';
import EditField from './EditField';
import VolumeEditor from './VolumeEditor';

export default function Sidebar() {
  const [models] = useModels();
  const [nodes, setNodes] = useNodes();
  // This function updates a node in-place
  const updateNode = useUpdateNode();

  const removeNode = (node: Node) => setNodes(nodes.remove(node));

  const [selectedNode, selectNode] = useState<Node | null>(null);
  const close = () => selectNode(null);

  return (
    <Row>
      <h6>Nodes</h6>
      <Table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Model</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {nodes.toList().map(node =>
            <tr key={node.nodeId}>
              <td><EditField value={node.name} setValue={name => updateNode({ ...node, name })} /></td>
              <td>{models.find(({ modelId }) => node.modelId === modelId)?.name || 'No model found'}</td>
              <td>
                <ButtonGroup>
                  <Button
                    variant='primary'
                    onClick={() => selectNode(node)}
                  >
                    <FaEllipsisH />
                  </Button>
                  <Button
                    variant='danger'
                    onClick={() => removeNode(node)}>
                    <FaTrash />
                  </Button>
                </ButtonGroup>
              </td>
            </tr>
          )}
          <NodeAddingForm />
        </tbody>
      </Table>
      {selectedNode &&
        <VolumeEditor node={selectedNode} selectNode={selectNode} close={close} />
      }
    </Row>
  );
}

function NodeAddingForm() {
  const [models] = useModels();

  // This is a hack-- the select element won't accept null as a value, so we define an alternate
  // null value-- nil. This hack isn't comprehensive. If the user somehow gets a UUID that is
  // equal to '0', then this will fail. However, this shouldn't happen for a UUID
  const nil = '0';


  const [selectedModelId, setSelectedModelId] = useState<UUID | typeof nil>(nil);

  const [nodes, setNodes] = useNodes();

  const addModelToEditor = (model: Model) => {
    const node = instantiateModel(model, model.name);
    setNodes(nodes.add(node));
  };

  // Whenever models change, set back to nil
  useEffect(() => {
    setSelectedModelId(nil);
  }, [models]);

  return (
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
  );
}