import React, { useRef } from 'react';
import { Button, CloseButton, Form, Modal } from 'react-bootstrap';
import { useRestoreState } from '../../state';
import { deserializeState, fileContent } from '../../utils';

interface LoadDialogProps {
  show: boolean;
  close: () => void;
}
export function LoadDialog({ show, close }: LoadDialogProps) {
  const restoreState = useRestoreState();

  const fileUploadRef = useRef<HTMLInputElement | null>(null);

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
          const contentResult = await fileContent(fileUploadRef!.current!);
          if (contentResult.kind === 'Success') {
            const content = contentResult.value;
            restoreState(deserializeState(content));
          }
          close();
        }}>Load</Button>
      </Modal.Body>
    </Modal>
  );
}