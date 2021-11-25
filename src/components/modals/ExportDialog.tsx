import React, { useState } from 'react';
import {
  Button,
  CloseButton,
  FloatingLabel,
  Form,
  Modal
} from 'react-bootstrap';
import { exportState } from '../../utils';
import { useStore } from '../../state';

interface ExportDialogProps {
  show: boolean;
  close: () => void;
}
export function ExportDialog({ show, close }: ExportDialogProps) {
  const state = useStore();
  const [filename, setFilename] = useState('solution.zip');
  const exportSolution = async () => {
    const blob = await exportState(state);
    saveAs(blob, filename);
  };

  return (
    <Modal show={show} onEscapeKeyDown={close}>
      <Modal.Header>
        <Modal.Title>Export Solution</Modal.Title>
        <CloseButton onClick={close} />
      </Modal.Header>
      <Modal.Body>
        <Form.Label >Filename</Form.Label>
        <Form.Control
          placeholder='solution.zip'
          value={filename}
          onChange={e => setFilename(e.target.value)}
        />
        <br />
        {/* TODO other export options here */}
        <FloatingLabel controlId='floatingSelect' label='Export to'>
          <Form.Select>
            <option>Docker Compose</option>
          </Form.Select>
        </FloatingLabel>
        <br />
        <Button onClick={() => {
          exportSolution();
          close();
        }}>Export</Button>
      </Modal.Body>
    </Modal>
  );
}