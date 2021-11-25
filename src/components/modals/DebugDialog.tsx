import React from 'react';
import {
  Modal,
  CloseButton
} from 'react-bootstrap';
import { useStore } from '../../state';


interface DebugDialogProps {
  show: boolean;
  close: () => void;
}
export default function DebugDialog({ show, close }: DebugDialogProps) {
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
