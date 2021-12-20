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
  Stage,
  UUID,
  Volume,
  VolumeType
} from '../types';
import {
  useStages,
  useUpdateStage
} from '../state';

interface VolumeAddingFormProps {
  stage: Stage;
  selectStageId: (id: UUID) => void;
}
function VolumeAddingForm({ stage, selectStageId }: VolumeAddingFormProps) {
  const updateStage = useUpdateStage();
  const [source, setSource] = useState('');
  const clearSource = () => setSource('');
  const [target, setTarget] = useState('');
  const clearTarget = () => setTarget('');
  const [type ] = useState(VolumeType.Bind);
  const addVolume = () => {
    const updated = { ...stage, volumes: stage.volumes.push({
      volumeId: uuid(), source, target, type
    }) };
    updateStage(updated);
    selectStageId(updated.stageId);
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
  stageId: UUID;
  selectStageId: (id: UUID) => void;
  close: () => void;
}
/**
 * This component is a modal that allows users to add and remove mounted volumes from stages
 */
export default function VolumeEditor({ stageId, selectStageId, close }: VolumeEditorProps) {
  const stages = useStages();
  const updateStage = useUpdateStage();
  const stage = stages.find(stage => stage.stageId === stageId);
  if (!stage) { return null; }
  const deleteVolume = (id: UUID) => {
    const idx = stage.volumes.findIndex(({ volumeId }) => volumeId === id);
    if (idx !== -1) {
      const stageWithoutVolume = {
        ...stage,
        volumes: stage.volumes.remove(idx)
      };
      updateStage(stageWithoutVolume);
    } else {
      console.error('attempt to delete volume that does not exist');
    }
  };
  return (
    <>
      <Modal.Header>
        <Modal.Title>{stage.name || 'No stage selected'}</Modal.Title>
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
            {stage?.volumes.map(({ source, target, type, volumeId }) =>
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
              </tr> || 'No stage selected')}
            {stageId &&
            <VolumeAddingForm stage={stage} selectStageId={selectStageId} />}
          </tbody>
        </Table>
      </Modal.Body>
    </>
  );
}