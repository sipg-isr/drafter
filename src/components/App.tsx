import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './Header';
import Editor from './Editor';
import Assets from './Assets';
import { BrowserRouter } from 'react-router-dom';
import { List } from 'immutable';
import { filter } from 'lodash';
import {
  Container,
  Row,
  Tab,
  Tabs
} from 'react-bootstrap';

function App() {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <Header />
      <Container>
        <Row>
          <hr />
        </Row>
        <Row>
          <Tabs defaultValue='assets'>
            <Tab eventKey='assets' title='Assets'>
              <Assets />
            </Tab>
            <Tab style={{padding:15}} eventKey='editor' title='Editor'>
              <Editor />
            </Tab>
          </Tabs>
        </Row>
      </Container>
    </BrowserRouter>
  );
}

export default App;