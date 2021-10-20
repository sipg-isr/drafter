import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';
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
};
