import React, { useState } from 'react';
import {
  Button,
  CloseButton,
  Form,
  Modal,
  Table
} from 'react-bootstrap';
import { v4 as uuid } from 'uuid';
import {
  FaPlus,
  FaTrash
} from 'react-icons/fa';
import {
  Node,
  UUID,
  Volume,
  VolumeType
} from '../types';
import {
  useNodes,
  useUpdateNode
} from '../state';

interface VolumeAddingFormProps {
  node: Node;
  selectNodeId: (id: UUID) => void;
}
function VolumeAddingForm({ node, selectNodeId }: VolumeAddingFormProps) {
  const updateNode = useUpdateNode();
  const [source, setSource] = useState('');
  const clearSource = () => setSource('');
  const [target, setTarget] = useState('');
  const clearTarget = () => setTarget('');
  const [type ] = useState(VolumeType.Bind);
  const addVolume = () => {
    const updated = { ...node, volumes: node.volumes.push({
      volumeId: uuid(), source, target, type
    }) };
    updateNode(updated);
    selectNodeId(updated.nodeId);
    clearSource();
    clearTarget();
  };

  return (
    <tr>
      <td>
        <Form.Control
          value={source}
          onChange={({ target: { value }}) => setSource(value)}
          placeholder='path/on/source'
        />
      </td>
      <td>
        <Form.Control
          value={target}
          onChange={({ target: { value }}) => setTarget(value)}
          placeholder='path/on/target'
        />
      </td>
      <td>
        <Form.Control
          value={type}
          disabled
        />
      </td>
      <td>
        <Button
          variant='primary'
          onClick={addVolume}
        >
          <FaPlus />
        </Button>
      </td>
    </tr>
  );
}

interface VolumeEditorProps {
  nodeId: UUID;
  selectNodeId: (id: UUID) => void;
  close: () => void;
}
export default function VolumeEditor({ nodeId, selectNodeId, close }: VolumeEditorProps) {
  const [nodes] = useNodes();
  const updateNode = useUpdateNode();
  const node = nodes.find(node => node.nodeId === nodeId);
  if (!node) { return null; }
  const deleteVolume = (id: UUID) => {
    const idx = node.volumes.findIndex(({ volumeId }) => volumeId === id);
    if (idx !== -1) {
      const nodeWithoutVolume = {
        ...node,
        volumes: node.volumes.remove(idx)
      };
      updateNode(nodeWithoutVolume);
    } else {
      console.error('attempt to delete volume that does not exist');
    }
  };
  return (
    <>
      <Modal.Header>
        <Modal.Title>{node.name || 'No node selected'}</Modal.Title>
        <CloseButton onClick={close} />
      </Modal.Header>
      <Modal.Body>
        <h5>Mounted Volumes</h5>
        <Table>
          <thead>
            <tr>
              <th>Source</th>
              <th>Target</th>
              <th>Type</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {node?.volumes.map(({ source, target, type, volumeId }) =>
              <tr key={volumeId}>
                <td>{source}</td>
                <td>{target}</td>
                <td>{type}</td>
                <td>
                  <Button
                    variant='danger'
                    onClick={() => deleteVolume(volumeId)}
                  >
                    <FaTrash />
                  </Button>
                </td>
              </tr> || 'No node selected')}
            {nodeId &&
            <VolumeAddingForm node={node} selectNodeId={selectNodeId} />}
          </tbody>
        </Table>
      </Modal.Body>
    </>
  );
}