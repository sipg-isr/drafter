import React from 'react';
import {
  Container,
  Nav,
  Navbar,
  Tabs
} from 'react-bootstrap';
import { name, version } from '../../package.json';

export default function Header() {
  return (
    <Navbar>
      <Container>
        <Nav>
          <Navbar.Brand href='/'>{name}</Navbar.Brand>
          <Navbar.Text>v{version}</Navbar.Text>
        </Nav>
      </Container>
    </Navbar>
  );
}
