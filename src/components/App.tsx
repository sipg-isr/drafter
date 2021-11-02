import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './Header';
import Editor from './Editor';
import Models from './Models';
import { BrowserRouter } from 'react-router-dom';
import { List } from 'immutable';
import {
  Row,
  Container,
  Tabs,
  Tab
} from 'react-bootstrap';
import { Model } from '../types';

function App() {
  // TODO store this somewhere like localStorage or idb-keyval
  // write a custom hook to serialize / deserialize this
  const [models, setModels] = useState<List<Model>>(List());

  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <Header />
      <Container>
        <Row>
          <hr />
        </Row>
        <Row>
          <Tabs defaultValue='models'>
            <Tab eventKey='models' title='Models'>
              <Models models={models} setModels={setModels} />
            </Tab>
            <Tab style={{padding:15}} eventKey='editor' title='Editor'>
              <Editor models={models} />
            </Tab>
          </Tabs>
        </Row>
      </Container>
    </BrowserRouter>
  );
}

export default App;
