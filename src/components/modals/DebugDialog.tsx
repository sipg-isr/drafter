import React from 'react';
import {
  Modal,
  CloseButton,
  Accordion
} from 'react-bootstrap';
import { useStore } from '../../state';


interface DebugDialogProps {
  show: boolean;
  close: () => void;
}
export function DebugDialog({ show, close }: DebugDialogProps) {
  const state = useStore();
  return (
    <Modal show={show} onEscapeKeyDown={close}>
      <Modal.Header>
        <Modal.Title>Debug Info</Modal.Title>
        <CloseButton onClick={close} />
      </Modal.Header>
      <Modal.Body>
        <h5>Edit History</h5>
        <Accordion>
          {state.actions.reverse().map((action, idx) =>
            <Accordion.Item eventKey={idx.toString()} key={idx} >
              <Accordion.Header>{`${state.actions.size - idx}: ${action.type}`}</Accordion.Header>
              <Accordion.Body>
                <pre>{JSON.stringify(action)}</pre>
              </Accordion.Body>
            </Accordion.Item>
          )}
        </Accordion>
      </Modal.Body>
    </Modal>
  );
}
