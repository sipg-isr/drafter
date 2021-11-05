import React, { useEffect, useState } from 'react';
import {
  Button,
  Table
} from 'react-bootstrap';
import { List, Map } from 'immutable';
import { FaPlus } from 'react-icons/fa';
import {
  UUID, Model
} from '../types';
import ModelView, { ModelEntry } from './ModelView';
import { useModels, useNodes, useAccessPoints, useEdges } from '../state';

export default function Models() {
  // These are the entries in the form
  const [entries, setEntries] = useState<List<ModelEntry>>(List([
    { kind: 'Edit', model: null } // Start with one empty model
  ]));
  // To add an entry by pushing it into the entries set
  const addEntry = (entry: ModelEntry) => setEntries(entries.push(entry));

  const [, setModels] = useModels();
  const [nodes, setNodes] = useNodes();
  const [accessPoints, setAccessPoints] = useAccessPoints();
  const [edges, setEdges] = useEdges();

  useEffect(() => {
    // Models have been updated
    const newModels = entries
      .reduce<Map<UUID, Model>>((acc, { model}) =>
        model ? acc.set(model.modelId, model) : acc,
        Map()
      );

    // Filter out only the nodes that are from these models
    const newNodes = nodes.filter(node =>
      newModels.find(({ modelId }) => node.modelId === modelId));

    // Filter out only the access points that are from these nodes
    const newAccessPoints = accessPoints.filter(ap =>
      newNodes.find(({ nodeId }) => ap.nodeId === nodeId));

    // Filter out only the edges that are from these access points
    const newEdges = edges.filter(edge =>
      newAccessPoints.find(({ accessPointId }) =>
        edge.requesterId === accessPointId || edge.responderId === accessPointId));

    // Now set everything, in reverse
    setEdges(newEdges);
    setAccessPoints(newAccessPoints);
    setNodes(newNodes);
    setModels(newModels);
  }, [entries]);

  return (
    <>
      <Table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Image</th>
            <th>Protobuf Interface</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, idx) => <ModelView
            key={`mv-${idx}`}
            entry={entry}
            setEntry={entry => setEntries(entries.set(idx, entry))}
            removeEntry={() => setEntries(entries.remove(idx))}
          />)}
          <tr>
            <td colSpan={4} style={{textAlign: 'center'}}>
              <Button
                variant='primary'
                onClick={() => addEntry({ kind: 'Edit', model: null})}
              ><FaPlus /></Button>
            </td>
          </tr>
        </tbody>
      </Table>
    </>
  );
}

FileList;