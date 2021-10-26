import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './Header';
import Editor from './Editor';
import Models from './Models';
import { BrowserRouter } from 'react-router-dom';
import {
  Row,
  Container,
  Col,
  Tabs,
  Tab
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
          <Tabs defaultValue="models">
            <Tab eventKey="models" title="Models">
              <Models />
            </Tab>
          </Tabs>
        </Row>
      </Container>
    </BrowserRouter>
  );
}

export default App;
