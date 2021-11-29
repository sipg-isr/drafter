import React from 'react';
import {
  Accordion,
  CloseButton,
  Modal,
} from 'react-bootstrap';
import { useStore } from '../../state';
import Listing from '../Listing';


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
          {state.actions.reverse().map(([date, action], idx) =>
          <Accordion.Item eventKey={idx.toString()}>
            <Accordion.Header>
              <span style={{
                textAlign: 'left',
                  width: '40%',
                  display: 'inline-block'
              }}>{action.type}</span>
              <em style={{
                textAlign: 'right',
                  width: '50%',
                  display: 'inline-block'
              }}
              >{date.toLocaleString()}
              </em>
            </Accordion.Header>
            <Accordion.Body>
              <Listing content={JSON.stringify(action)} />
            </Accordion.Body>
          </Accordion.Item>)}
        </Accordion>
      </Modal.Body>
    </Modal>
  );
}