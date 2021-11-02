import React from 'react';
import {
  Container,
  Nav,
  Navbar
} from 'react-bootstrap';
import EditMenu from './EditMenu';
import { name, version } from '../../package.json';

export default function Header() {
  return (
    <Navbar>
      <Container>
        <Nav>
          <Navbar.Brand href='/'>{name}</Navbar.Brand>
          <Navbar.Text>v{version}</Navbar.Text>
          <EditMenu />
        </Nav>
      </Container>
    </Navbar>
  );
}