import {
  Row,
  Button,
  Table
} from 'react-bootstrap';
import {
  List,
  Set
} from 'immutable';
import { FaPlus, FaTrash } from 'react-icons/fa';
import {
  Model,
  Node,
} from '../types';

interface SidebarProps {
  models: List<Model>;
  addModelToEditor: (model: Model) => void;
  nodes: Set<Node>;
  removeNode: (node: Node) => void;
};
export default function Sidebar({
  models,
  addModelToEditor,
  nodes,
  removeNode
}: SidebarProps) {
  return (
    <>
      <Row>
        <Table>
          <thead>
            <tr>
              <th colSpan={3}>Available models</th>
            </tr>
          </thead>
          <tbody>
          {models.map(model =>
          <tr key={model.name}>
            <td>{model.name}</td>
            <td>{model.image}</td>
            <td>
              <Button onClick={() => addModelToEditor(model)}>
              <FaPlus />
              </Button>
            </td>
          </tr>
          )}
          </tbody>
        </Table>
      </Row>
      <Row><hr /></Row>
      <Row>
        <Table>
          <thead>
            <tr>
              <th colSpan={3}>Nodes</th>
            </tr>
          </thead>
          <tbody>
            {nodes.map(node =>
            <tr key={node.name}>
              <td>{node.name}</td>
              <td>{node.modelName}</td>
              <td>
                <Button
                  variant="danger"
                  onClick={() => removeNode(node)}>
                  <FaTrash />
                </Button>
              </td>
            </tr>
            )}
          </tbody>
        </Table>
      </Row>
    </>
  );
}
