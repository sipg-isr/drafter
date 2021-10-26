import React, { useState } from 'react';
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceX
} from 'd3-force';
import {
  Button,
  Form
} from 'react-bootstrap';
import { parse, Service } from 'protobufjs';

export default function Editor() {
  const [text, setText] = useState('');
  return (
    <>
      <Form.Control as="textarea"
        value={text}
        onChange={event => setText(event.target.value)}
      />
      <Button onClick={() => {
        const { root } = parse(text);
        // this is a bit of a hack to get only the services.
        // We start with all the contained objects (nestedArray)
        // Then we filter out only the ones whose JSON representations have a `methods` field
        const services = root
          .nestedArray
          .filter(reflectionObject => reflectionObject.toJSON().methods)
          .map(obj => obj as Service);

        const [service] = services;
        const methods = service
          .methodsArray
          .map(method => [
            method.name,
            root.lookupType(method.requestType).toJSON(),
            root.lookupType(method.responseType).toJSON()
          ]);

        console.log(methods);
      }}>Clicky</Button>
    </>
  );
};
