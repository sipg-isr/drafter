import React, { useState } from 'react';
import {
  Button,
  Modal,
  CloseButton,
  Table,
  Form
} from 'react-bootstrap';
import { v4 as uuid } from 'uuid';
import {
  FaPlus
} from 'react-icons/fa';
import {
  Node,
  VolumeType
} from '../types';
import {
  useUpdateNode
} from '../state';

interface VolumeEditorProps {
  selectNode: (node: Node) => void;
  node: Node;
  close: () => void;
};
export default function VolumeEditor({ node, selectNode, close }: VolumeEditorProps) {
    return (
      <Modal show={node !== null} onEscapeKeyDown={close}>
        <Modal.Header>
          <Modal.Title>{node.name}</Modal.Title>
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
              {node.volumes.map(({ source, target, type }) => <tr>
                <td>{source}</td>
                <td>{target}</td>
                <td>{type}</td>
                <td></td>
              </tr>)}
              <VolumeAddingForm node={node} selectNode={selectNode} />
            </tbody>
          </Table>
        </Modal.Body>
      </Modal>
    );
}

interface VolumeAddingFormProps {
  node: Node;
  selectNode: (node: Node) => void;
}
function VolumeAddingForm({ node, selectNode }: VolumeAddingFormProps) {
  const updateNode = useUpdateNode();
  const [source, setSource] = useState('');
  const [target, setTarget] = useState('');
  const [type, ] = useState(VolumeType.Bind);
  const addVolume = () => {
    const updated = { ...node, volumes: node.volumes.push({
      volumeId: uuid(), source, target, type
    }) };
    updateNode(updated);
    selectNode(updated);
  }

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
