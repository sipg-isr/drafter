import React, { useState, useEffect } from 'react';
import {
  Button,
  Table
} from 'react-bootstrap';
import { List } from 'immutable';
import { FaPlus } from 'react-icons/fa';
import ModelView, { ModelEntry } from './ModelView';
import { useStore } from '../state';

interface ModelsProps {
}
export default function Models({ }: ModelsProps) {
  const [entries, setEntries] = useState<List<ModelEntry>>(List());
  const addModel = (model: ModelEntry) => setEntries(entries.push(model));

  const setModels = useStore(state => state.setModels);

  useEffect(() => {
    setModels(entries
      .filter(entry => entry.model !== null )
      .map(({ model }) => model!)
    )
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
            removeModel={() => {
              setEntries(entries.remove(entries.indexOf(entry)));
            }}
            setEntry={entry => setEntries(entries.set(idx, entry))}
          />)}
          <tr>
            <td colSpan={4} style={{textAlign: 'center'}}>
              <Button
                variant='primary'
                onClick={() => addModel({ kind: 'Edit', model: null})}
              ><FaPlus /></Button>
            </td>
          </tr>
        </tbody>
      </Table>
    </>
  );
}

FileList;