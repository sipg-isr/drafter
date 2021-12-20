import React, { useEffect, useState, useMemo } from 'react';
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
  UUID,
  HasAssetId
} from '../types';
import {
  instantiateAsset,
  findAsset,
  findRemoteMethod,
  reportError
} from '../utils';
import {
  useAssets,
  useStages,
  useAddStage,
  useUpdateStage
} from '../state';
import EditField from './EditField';
import VolumeEditor from './VolumeEditor';

// This is a hack-- the select element won't accept null as a value, so we define an alternate
// null value-- nil. This hack isn't comprehensive. If the user somehow gets a UUID that is
// equal to '0', then this will fail. However, this shouldn't happen for a UUID
const nil = '0';
type Nil = typeof nil;
export type MethodSelection = (HasAssetId & {
  remoteMethodId: UUID | Nil;
}) | Nil;

function StageAddingForm() {


  const [methodSelection, setMethodSelection] = useState<MethodSelection>(nil);
  const [assets] = useAssets();
  const addStage = useAddStage();

  // Whenever assets change, set back to nil
  useEffect(() => {
    setMethodSelection(nil);
  }, [assets]);

  // Deduce the currently-selected asset from the methodSelection object
  const selectedAsset = useMemo(() => {
    if (methodSelection !== nil) {
      const asset = findAsset(assets, methodSelection.assetId);
      if (asset.kind === 'Asset') {
        return asset;
      } else {
        reportError(asset);
        return null;
      }
    } else {
      return null;
    }
  }, [methodSelection]);

  return (
    <tr>
      <td colSpan={methodSelection !== nil ? 1 : 2}>
        <FloatingLabel controlId='floatingSelectGrid' label='Add asset' defaultValue={nil}>
          <Form.Select
            aria-label='Add another asset'
            onChange={({ target: { value } }) => {
              if (value !== nil) {
                setMethodSelection({
                  assetId: value,
                  remoteMethodId: nil
                });
              } else {
                setMethodSelection(nil);
              }
            }}>
            <option value={nil}>Select Asset to add</option>
            {assets.map(({ assetId, name }) =>
              <option key={assetId} value={assetId}>{name}</option>
            )}
          </Form.Select>
        </FloatingLabel>
      </td>
      {methodSelection !== nil ?
        <td>
          <FloatingLabel controlId='floatingSelectGrid' label='Select method'>
            <Form.Select
              aria-label='Select method'
              onChange={({ target: { value }}) => {
                setMethodSelection({
                  ...methodSelection,
                  remoteMethodId: value
                })
              }}>
              <option value={nil}>Select method from asset</option>
              {selectedAsset!.methods.map(({ name, remoteMethodId }) =>
                <option key={remoteMethodId} value={remoteMethodId}>{name}</option>
              )}
            </Form.Select>
          </FloatingLabel>
        </td>
        : null}
      <td>
        <Button
          disabled={methodSelection === nil || methodSelection.remoteMethodId === nil}
          variant='primary'
          onClick={() => {
            if (methodSelection !== nil && methodSelection.remoteMethodId !== nil && selectedAsset) {
              const stage = instantiateAsset(selectedAsset, methodSelection)
              if (stage.kind === 'Stage') {
                addStage(stage);
              }
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