import React from 'react';
import { Coordinates } from '../types';

interface EdgeSVGProps {
  origin: Coordinates;
  destination: Coordinates;
}
/**
 * A simple SVG component for rendering edges between stages
 */
export default function EdgeSVG({
  origin, destination
}: EdgeSVGProps) {
  return <line
    x1={origin.x}
    y1={origin.y}
    x2={destination.x}
    y2={destination.y}
    stroke='#999'
    strokeOpacity='0.6'
    strokeWidth='10'
  />;
}