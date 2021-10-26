import React from 'react';
import Table from 'react-bootstrap/Table';
import Form from  'react-bootstrap/Form';

// This represents a field in the process of being edited
enum EditState {
  Editing,
  Saved
}

interface EditableModelProps {
    name: [EditState, string];
    // An identifying image name, like sipgisr/image-source:latest
    image: [EditState, string];
    // The protobuf file. TODO use a Protobuf type from
    // https://github.com/protobufjs/protobuf.js here
    // protobuf: [EditState, Protobuf];
}

function EditableModel(props: EditableModelProps) {
  const { name, image } = props;
  return (
    <tr>
        {[name, image].map(pair => {
          // Destructure out the state and text
          const [state, text] = pair;
          if (state === EditState.Editing) {
            return <td><Form.Control value={text} /></td>;
          } else if (state === EditState.Saved) {
            return <td><pre>{text}</pre></td>;
          } else { return 'unexpected case' }
        })}
      <td>TODO</td>
    </tr>
  );
}

export default function Models() {
  // TODO make this an immutable data type and store it somewhere like, localStorage or idb-keyval
  // write a custom hook to serialize / deserialize this
  const vals: EditableModelProps[] = [
    {
      name: [EditState.Saved, 'Name'],
      image: [EditState.Editing, 'Image name']
    }
  ]

  return (
    <Table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Image</th>
          <th>Protobuf File</th>
        </tr>
      </thead>
      <tbody>
        {vals.map(({ name, image }) => <EditableModel name={name} image={image}/>)}
      </tbody>
    </Table>
  );
}