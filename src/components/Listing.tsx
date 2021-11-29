import React from 'react';

interface ListingProps {
  content: string
}
export default function Listing({ content }: ListingProps) {
  // TODO make this div style configurable based on the current theme?
  // TODO add syntax highlighting?
  return <pre style={{
    borderRadius: '5px',
    backgroundColor: '#eee',
    padding: '10px',
  }}>
    <code>{content}</code>
  </pre>
}
