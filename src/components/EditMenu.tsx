import React, { useState } from 'react';
import {
  Container,
  ListGroup,
  Modal,
  CloseButton
} from 'react-bootstrap';
import SaveDialog from './modals/SaveDialog';
import LoadDialog from './modals/LoadDialog';
import ClearDialog from './modals/ClearDialog';
import ExportDialog from './modals/ExportDialog';
import { useStore } from '../state';

/**
 * The different possible dialogs that can be displayed to the user
 */
enum DialogOption {
  Save, Load, Export, Clear, Debug
}


interface DebugDialogProps {
  show: boolean;
  close: () => void;
}
function DebugDialog({ show, close }: DebugDialogProps) {
  const state = useStore();
  return (
    <Modal show={show} onEscapeKeyDown={close}>
      <Modal.Header>
        <Modal.Title>Debug Info</Modal.Title>
        <CloseButton onClick={close} />
      </Modal.Header>
      <Modal.Body>
        <h5>State</h5>
        <pre>
          {JSON.stringify(state, null, 2)}
        </pre>
      </Modal.Body>
    </Modal>
  );
}

export default function EditMenu() {
  const [currentDialog, setCurrentDialog] = useState<DialogOption | null>(null);

  // Control whether the save dialog is open
  const openSaveDialog = () => setCurrentDialog(DialogOption.Save);
  const openLoadDialog = () => setCurrentDialog(DialogOption.Load);
  const openClearDialog = () => setCurrentDialog(DialogOption.Clear);
  const openExportDialog = () => setCurrentDialog(DialogOption.Export);
  const openDebugDialog = () => setCurrentDialog(DialogOption.Debug);
  const closeDialog = () => setCurrentDialog(null);

  return (
    <Container>
      <ListGroup horizontal>
        <ListGroup.Item action onClick={openSaveDialog}>Save</ListGroup.Item>
        <ListGroup.Item action onClick={openLoadDialog}>Load</ListGroup.Item>
        <ListGroup.Item action onClick={openClearDialog}>Clear</ListGroup.Item>
        <ListGroup.Item action onClick={openExportDialog}>Export</ListGroup.Item>
        <ListGroup.Item action style={{ whiteSpace: 'nowrap' }}onClick={openDebugDialog}>Debug Info</ListGroup.Item>
      </ListGroup>

      <SaveDialog show={currentDialog === DialogOption.Save} close={closeDialog} />
      <LoadDialog show={currentDialog === DialogOption.Load} close={closeDialog} />
      <ClearDialog show={currentDialog === DialogOption.Clear} close={closeDialog} />
      <ExportDialog show={currentDialog === DialogOption.Export} close={closeDialog} />
      <DebugDialog show={currentDialog === DialogOption.Debug} close={closeDialog} />
    </Container>
  );
}