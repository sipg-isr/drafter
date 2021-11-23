import React, { useState } from 'react';
import { saveAs } from 'file-saver';
import { Button, Form, Modal, CloseButton } from 'react-bootstrap';
import { serializeState } from '../../utils';
import { useStore } from '../../state';

interface SaveDialogProps {
  show: boolean;
  close: () => void;
}
export default function SaveDialog({ show, close }: SaveDialogProps) {
  const [filename, setFilename] = useState('solution.json');
  const state = useStore();

  // A short function to save the editor state to disk
  const save = () => {
    const serialized = serializeState(state);
    saveAs(new Blob([serialized]), filename);
    close();
  };

  return (
    <Modal show={show} onEscapeKeyDown={close}>
      <Modal.Header>
        <Modal.Title>Save Solution</Modal.Title>
        <CloseButton onClick={close} />
      </Modal.Header>
      <Modal.Body>
        <Form.Label >Filename</Form.Label>
        <Form.Control
          placeholder='solution.json'
          value={filename}
          onChange={e => setFilename(e.target.value)}
        />
        <br />
        <Button onClick={save}>Save</Button>
      </Modal.Body>
    </Modal>
  );
}
