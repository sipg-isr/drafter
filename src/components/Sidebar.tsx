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
  Stage,
  UUID
} from '../types';
import { instantiateAsset } from '../utils';
import {
  useAssets,
  useStages,
  useUpdateStage
} from '../state';
import EditField from './EditField';
import VolumeEditor from './VolumeEditor';

function StageAddingForm() {
  const [assets] = useAssets();

  // This is a hack-- the select element won't accept null as a value, so we define an alternate
  // null value-- nil. This hack isn't comprehensive. If the user somehow gets a UUID that is
  // equal to '0', then this will fail. However, this shouldn't happen for a UUID
  const nil = '0';


  const [selectedAssetId, setSelectedAssetId] = useState<UUID | typeof nil>(nil);

  const [stages, setStages] = useStages();

  /*const addAssetToEditor = (asset: Asset) => {
    const stage = instantiateAsset(asset, asset.name);
    setStages(stages.add(stage));
  };*/

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
              // addAssetToEditor(asset);
            }
          }}
        >
          <FaPlus />
        </Button>
      </td>
    </tr>
  );
}

/**
 * This component is used to add and remove stages from the editor
 */
export default function Sidebar() {
  const [assets] = useAssets();
  const [stages, setStages] = useStages();
  // This function updates a stage in-place
  const updateStage = useUpdateStage();

  const removeStage = (stage: Stage) => setStages(stages.remove(stage));

  const [selectedStageId, selectStageId] = useState<UUID | null>(null);
  const close = () => selectStageId(null);

  return (
    <Row>
      <h6>Stages</h6>
      <Table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Asset</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {stages.toList().map(stage =>
            <tr key={stage.stageId}>
              <td><EditField value={stage.name} setValue={name => updateStage({ ...stage, name })} /></td>
              <td>{assets.find(({ assetId }) => stage.assetId === assetId)?.name || 'No asset found'}</td>
              <td>
                <ButtonGroup>
                  <Button
                    variant='primary'
                    onClick={() => selectStageId(stage.stageId)}
                  >
                    <FaEllipsisH />
                  </Button>
                  <Button
                    variant='danger'
                    onClick={() => removeStage(stage)}>
                    <FaTrash />
                  </Button>
                </ButtonGroup>
              </td>
            </tr>
          )}
          <StageAddingForm />
        </tbody>
      </Table>
      <Modal show={selectedStageId !== null} onEscapeKeyDown={close}>
        {selectedStageId !== null  ?
          <VolumeEditor stageId={selectedStageId} selectStageId={selectStageId} close={close} /> :
          'No stage selected'
        }
      </Modal>
    </Row>
  );
}