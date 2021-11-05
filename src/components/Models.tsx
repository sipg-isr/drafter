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
import { useModels, useNodes, useEdges } from '../state';

export default function Models() {
  // These are the entries in the form
  const [entries, setEntries] = useState<List<ModelEntry>>(List([
    { kind: 'Edit', model: null } // Start with one empty model
  ]));
  // To add an entry by pushing it into the entries set
  const addEntry = (entry: ModelEntry) => setEntries(entries.push(entry));

  const [, setModels] = useModels();
  const [nodes, setNodes] = useNodes();
  const [edges, setEdges] = useEdges();

  useEffect(() => {
    // Models have been updated
    const models = entries
      .reduce<Map<UUID, Model>>((acc, { model}) =>
        model ? acc.set(model.modelId, model) : acc,
        Map()
      );

    setModels(models);
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