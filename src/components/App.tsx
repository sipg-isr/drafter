import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './Header';
import { BrowserRouter } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <Header />
      <Container>
        <Row>
          <hr />
        </Row>
        body
      </Container>
    </BrowserRouter>
  );
}

export default App;
