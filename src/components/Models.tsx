import React, { useEffect, useState } from 'react';
import {
  Button,
  Table
} from 'react-bootstrap';
import { List } from 'immutable';
import { FaPlus } from 'react-icons/fa';
import ModelView, { ModelEntry } from './ModelView';
import { useModels } from '../state';

interface ModelsProps {
}
export default function Models({ }: ModelsProps) {
  // These are the entires in the form
  const [entries, setEntries] = useState<List<ModelEntry>>(List([
    { kind: 'Edit', model: null } // Start with one empty model
  ]));
  // To add an entry by pushing it into the entries set
  const addEntry = (entry: ModelEntry) => setEntries(entries.push(entry));

  const [, setModels] = useModels();

  useEffect(() => {
    // Whenever entries are updated, filter out the ones that have associated models, and set
    // those models
    setModels(entries
      .filter(entry => entry.model !== null )
      .map(({ model }) => model!)
    );
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