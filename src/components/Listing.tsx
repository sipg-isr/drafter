import React from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { Button } from 'react-bootstrap';
import { FaCopy } from 'react-icons/fa';

// This is the the basic unit of size
const unit = 5;

interface ListingProps {
  content: string
  language: string
}
/**
 * A simple utility component that displays syntax-highlighted source code
 */
export default function Listing({ content, language }: ListingProps) {
  // TODO make this div style configurable based on the current theme?
  // TODO add syntax highlighting?
  return <div style={{
    position: 'relative'
  }}>
    <SyntaxHighlighter language={language} style={dark} customStyle={{
      padding: `${2 * unit}px`,
      borderRadius: `${unit}px`
    }}>
      {content}
    </SyntaxHighlighter>
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
  </div>;

}