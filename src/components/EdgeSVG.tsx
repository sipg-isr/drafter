import React from 'react';

interface EdgeSVGProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}
/**
 * A simple SVG component for rendering edges between stages
 */
export default function EdgeSVG({
  x1, x2, y1, y2
}: EdgeSVGProps) {
  return <line
    x1={x1}
    y1={y1}
    x2={x2}
    y2={y2}
    stroke='#999'
    strokeOpacity='0.6'
    strokeWidth='10'
  />;
}