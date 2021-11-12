import React, { useState } from 'react';
import {
  Button,
  Col,
  Form,
  Row
} from 'react-bootstrap';
import { FaCheck } from 'react-icons/fa';

enum EditState {
  Edit, Display
}
interface EditFieldProps {
  value: string;
  setValue: (value: string) => void;
}
export default function EditField({ value, setValue }: EditFieldProps) {
  const [editState, setEditState] = useState(EditState.Display);
  const [fieldValue, setFieldValue] = useState(value);

  if (editState === EditState.Display) {
    return <span onClick={() => setEditState(EditState.Edit)}>{value}</span>
  } else {
    return <Row>
      <Col>
        <Form.Control value={fieldValue} onChange={({ target: { value } }) => setFieldValue(value)} />
      </Col>
      <Col>
        <Button onClick={() => {
          setValue(fieldValue);
          setEditState(EditState.Display);
        }}><FaCheck /></Button>
      </Col>
    </Row>
  }
}
