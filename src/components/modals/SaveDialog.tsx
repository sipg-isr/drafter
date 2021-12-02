import React, { useState } from 'react';
import { saveAs } from 'file-saver';
import { Button, CloseButton, Form, Modal } from 'react-bootstrap';
import { serializeState } from '../../utils';
import { useStore } from '../../state';

interface SaveDialogProps {
  show: boolean;
  close: () => void;
}
/**
 * Component with a modal dialog asking the user to save the current editor state
 */
export function SaveDialog({ show, close }: SaveDialogProps) {
  // TODO choose a custom extension for drafter saved documents?
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