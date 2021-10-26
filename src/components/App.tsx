import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './Header';
import Editor from './Editor';
import { BrowserRouter } from 'react-router-dom';
import { Col } from 'react-bootstrap';

function App() {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <Header />
      <Container>
        <Row>
          <hr />
        </Row>
        <Row>
          <Col>
            <Editor />
          </Col>
        </Row>
      </Container>
    </BrowserRouter>
  );
}

export default App;
