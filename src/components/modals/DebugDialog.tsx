import React from 'react';
import {
  Accordion,
  CloseButton,
  Modal,
  Table
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
        <Table striped hover>
          <thead>
            <tr>
            <th>Action</th>
            <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {state.actions.reverse().map(([date, action]) =>
            <tr key={date.toString()} onClick={() => console.log('yo')}>
                <td>{action.type}</td>
                <td>{date.toLocaleString()}</td>
              </tr>
            )}
          </tbody>
        </Table>
      </Modal.Body>
    </Modal>
  );
}