import React, { useRef, useState } from 'react';
import {
  Button,
  CloseButton,
  Container,
  FloatingLabel,
  Form,
  ListGroup,
  Modal
} from 'react-bootstrap';
import { State, useStore } from '../state';
import { deserializeState, exportState, fileContent, serializeState } from  '../utils';
import { saveAs } from 'file-saver';

/**
 * The different possible dialogs that can be displayed to the user
 */
enum DialogOption {
  Save, Load, Export
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
          if (content) {
            restoreState(deserializeState(content));
          }
          close();
        }}>Load</Button>
      </Modal.Body>
    </Modal>
  );
}

interface ExportDialogProps {
  show: boolean;
  close: () => void;
}
function ExportDialog({ show, close }: ExportDialogProps) {
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
        <Button onClick={exportSolution}>Export</Button>
      </Modal.Body>
    </Modal>
  );
}

export default function EditMenu() {
  const [currentDialog, setCurrentDialog] = useState<DialogOption | null>(null);

  // Control whether the save dialog is open
  const openSaveDialog = () => setCurrentDialog(DialogOption.Save);
  const openLoadDialog = () => setCurrentDialog(DialogOption.Load);
  const openExportDialog = () => setCurrentDialog(DialogOption.Export);
  const closeDialog = () => setCurrentDialog(null);

  return (
    <Container>
      <ListGroup horizontal>
        <ListGroup.Item action onClick={openSaveDialog}>Save</ListGroup.Item>
        <ListGroup.Item action onClick={openLoadDialog}>Load</ListGroup.Item>
        <ListGroup.Item action onClick={openExportDialog}>Export</ListGroup.Item>
      </ListGroup>

      <SaveDialog show={currentDialog === DialogOption.Save} close={closeDialog} />
      <LoadDialog show={currentDialog === DialogOption.Load} close={closeDialog} />
      <ExportDialog show={currentDialog === DialogOption.Export} close={closeDialog} />
    </Container>
  );
}