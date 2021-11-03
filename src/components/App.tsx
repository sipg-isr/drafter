import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './Header';
import Editor from './Editor';
import Models from './Models';
import { BrowserRouter } from 'react-router-dom';
import { List } from 'immutable';
import { filter } from 'lodash';
import {
  Container,
  Row,
  Tab,
  Tabs
} from 'react-bootstrap';
import { ModelViewState } from './ModelView';

function App() {
  // TODO store this somewhere like localStorage or idb-keyval
  // write a custom hook to serialize / deserialize this
  const [modelEntries, setModelEntries] = useState<List<ModelViewState>>(List());

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
              <Models models={modelEntries} setModels={setModelEntries} />
            </Tab>
            <Tab style={{padding:15}} eventKey='editor' title='Editor'>
              <Editor models={modelEntries.filter(model => model.model).map(model => model.model!)} />
            </Tab>
          </Tabs>
        </Row>
      </Container>
    </BrowserRouter>
  );
}

export default App;