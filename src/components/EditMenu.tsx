import React, { useRef, useState } from 'react';
import {
  Button,
  CloseButton,
  Container,
  Form,
  ListGroup,
  Modal
} from 'react-bootstrap';
import { State, useStore } from '../state';
import { deserializeState, fileContent, serializeState } from  '../utils';
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
}

interface LoadDialogProps {
  show: boolean;
  close: () => void;
}
function LoadDialog({ show, close }: LoadDialogProps) {

  const fileUploadRef = useRef<HTMLInputElement | null>(null);
  const restoreState = useStore(state => state.restoreState);

  return (
    <Modal show={show} onEscapeKeyDown={close}>
      <Modal.Header>
        <Modal.Title>Load a solution from a File</Modal.Title>
        <CloseButton onClick={close} />
      </Modal.Header>
      <Modal.Body>
        <Form.Label>Solution file</Form.Label>
        <Form.Control type='file' ref={fileUploadRef} />
        <br />
        <Button onClick={async () => {
          const content = await fileContent(fileUploadRef!.current!);
          console.log(deserializeState(content!));
          if (content) {
            restoreState(deserializeState(content));
          }
        }}>Load</Button>
      </Modal.Body>
    </Modal>
  );
}