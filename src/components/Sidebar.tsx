import React, { useEffect, useState } from 'react';
import {
  Button,
  ButtonGroup,
  Col,
  FloatingLabel,
  Form,
  Modal,
  Row,
  Table
} from 'react-bootstrap';
import { FaCheck, FaEllipsisH, FaPlus, FaTrash } from 'react-icons/fa';
import {
  Asset,
  Node,
  UUID
} from '../types';
import { instantiateAsset } from '../utils';
import {
  useAssets,
  useNodes,
  useUpdateNode
} from '../state';
import EditField from './EditField';
import VolumeEditor from './VolumeEditor';

function NodeAddingForm() {
  const [assets] = useAssets();

  // This is a hack-- the select element won't accept null as a value, so we define an alternate
  // null value-- nil. This hack isn't comprehensive. If the user somehow gets a UUID that is
  // equal to '0', then this will fail. However, this shouldn't happen for a UUID
  const nil = '0';


  const [selectedAssetId, setSelectedAssetId] = useState<UUID | typeof nil>(nil);

  const [nodes, setNodes] = useNodes();

  const addAssetToEditor = (asset: Asset) => {
    const node = instantiateAsset(asset, asset.name);
    setNodes(nodes.add(node));
  };

  // Whenever assets change, set back to nil
  useEffect(() => {
    setSelectedAssetId(nil);
  }, [assets]);

  return (
    <tr>
      <td colSpan={2}>
        <FloatingLabel controlId='floatingSelectGrid' label='Add asset' defaultValue={nil}>
          <Form.Select aria-label='Add another asset' onChange={({ target: { value } }) => setSelectedAssetId(value)}>
            <option value={nil}>Select Asset to add</option>
            {assets.map(({ assetId, name }) =>
              <option key={assetId }value={assetId}>{name}</option>
            )}
          </Form.Select>
        </FloatingLabel>
      </td>
      <td>
        <Button
          disabled={ selectedAssetId === nil }
          variant='primary'
          onClick={() => {
            const asset = assets.find(({ assetId }) => assetId === selectedAssetId);
            if (asset) {
              addAssetToEditor(asset);
            }
          }}
        >
          <FaPlus />
        </Button>
      </td>
    </tr>
  );
}

export default function Sidebar() {
  const [assets] = useAssets();
  const [nodes, setNodes] = useNodes();
  // This function updates a node in-place
  const updateNode = useUpdateNode();

  const removeNode = (node: Node) => setNodes(nodes.remove(node));

  const [selectedNodeId, selectNodeId] = useState<UUID | null>(null);
  const close = () => selectNodeId(null);

  return (
    <Row>
      <h6>Nodes</h6>
      <Table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Asset</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {nodes.toList().map(node =>
            <tr key={node.nodeId}>
              <td><EditField value={node.name} setValue={name => updateNode({ ...node, name })} /></td>
              <td>{assets.find(({ assetId }) => node.assetId === assetId)?.name || 'No asset found'}</td>
              <td>
                <ButtonGroup>
                  <Button
                    variant='primary'
                    onClick={() => selectNodeId(node.nodeId)}
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
      <Modal show={selectedNodeId !== null} onEscapeKeyDown={close}>
        {selectedNodeId !== null  ?
          <VolumeEditor nodeId={selectedNodeId} selectNodeId={selectNodeId} close={close} /> :
          'No node selected'
        }
      </Modal>
    </Row>
  );
}