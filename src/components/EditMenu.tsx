import React, { useState } from 'react';
import {
  Button,
  Container,
  ListGroup,
  Modal,
  CloseButton,
  Form
} from 'react-bootstrap';
import { useStore, State } from '../state';
import { serializeState } from  '../utils';
import { saveAs } from 'file-saver';

/**
 * The different possible dialogs that can be displayed to the user
 */
enum DialogOption {
  Save, Load
}

export default function EditMenu() {
  const dummy = () => {
    // TODO actually do something here
    console.log('Not yet implemented');
  };

  const [currentDialog, setCurrentDialog] = useState<DialogOption | null>(null);

  // Control whether the save dialog is open
  const openSaveDialog = () => setCurrentDialog(DialogOption.Save);
  const openLoadDialog = () => setCurrentDialog(DialogOption.Load);
  const closeDialog = () => setCurrentDialog(null);

  const store = useStore();
  return (
    <Container>
      <ListGroup horizontal>
        <ListGroup.Item action onClick={openSaveDialog}>Save</ListGroup.Item>
        <ListGroup.Item action onClick={openLoadDialog}>Load</ListGroup.Item>
        <ListGroup.Item action onClick={dummy}>Export</ListGroup.Item>
      </ListGroup>

      <SaveDialog show={currentDialog === DialogOption.Save} close={closeDialog} />
      <LoadDialog show={currentDialog === DialogOption.Load} close={closeDialog} />
    </Container>
  );
}

interface SaveDialogProps {
  show: boolean;
  close: () => void;
}
function SaveDialog({ show, close }: SaveDialogProps) {
  const [filename, setFilename] = useState('solution.json');
  const state = useStore();

  // A short function to save the editor state to disk
  const save = () => {
    const serialized = serializeState(state);
    saveAs(new Blob([serialized]), filename);
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
};

interface LoadDialogProps {
  show: boolean;
  close: () => void;
}
function LoadDialog({ show, close }: LoadDialogProps) {
  return (
    <Modal show={show} onEscapeKeyDown={close}>
      <Modal.Header>
        <Modal.Title>Load saved</Modal.Title>
        <CloseButton onClick={close} />
      </Modal.Header>
      <Modal.Body>
        yeah
      </Modal.Body>
    </Modal>
  );
}