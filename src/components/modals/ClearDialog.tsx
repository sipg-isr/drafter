import React from 'react';
import {
  Modal,
  Button,
  CloseButton
} from 'react-bootstrap';
import { useDispatch } from '../../state';

interface ClearDialogProps {
  show: boolean;
  close: () => void;
}
export default function ClearDialog({ show, close }: ClearDialogProps) {
  const dispatch = useDispatch();
  return (
    <Modal show={show} onEscapeKeyDown={close}>
      <Modal.Header>
        <Modal.Title>Really clear the editor?</Modal.Title>
        <CloseButton onClick={close} />
      </Modal.Header>
      <Modal.Body>
        <Button variant='primary' onClick={close}>Cancel</Button>
        &nbsp;
        <Button variant='danger' onClick={() => {
          dispatch({ type: 'ClearState' });
          close();
        }}>Clear</Button>
      </Modal.Body>
    </Modal>
  );
}
