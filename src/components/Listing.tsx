import React from 'react';
import { Button } from 'react-bootstrap';
import { FaCopy } from 'react-icons/fa';

// This is the the basic unit of size
const unit = 5;

interface ListingProps {
  content: string
}
export default function Listing({ content }: ListingProps) {
  // TODO make this div style configurable based on the current theme?
  // TODO add syntax highlighting?
  return <div style={{
    position: 'relative',
    borderRadius: `${unit}px`,
    backgroundColor: '#eee',
    padding: `${unit}px`,
  }}>
    <code>{content}</code>
    <Button
      variant='outline-secondary'
      size='sm'
      style={{
        position: 'absolute',
          right: `${unit}px`,
          top: `${unit}px`
      }}
      onClick={() =>
        navigator.clipboard.writeText(content)
      }
    >
      <FaCopy size={3 * unit}/>
    </Button>
  </div>

}
