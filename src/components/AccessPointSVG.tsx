import {
  AccessPoint,
  Coordinates
} from '../types';
import {
  objectToColor
} from '../utils';

const outerRadius = 12;
const innerRadius = outerRadius / 2;

interface AccessPointSVGProps {
  location: Coordinates;
  accessPoint: AccessPoint;
}
export default function AccessPointSVG({
  accessPoint,
  location
}: AccessPointSVGProps) {
  const color = objectToColor(accessPoint.type);
  const { x, y } = location;

  return (
    <>
      {accessPoint.type.streamed ?  <>{
        [1, 2].map(idx =>
          <circle
            key={idx}
            r={outerRadius}
            cx={x - idx * innerRadius / 2}
            cy={y - idx * innerRadius / 2}
            stroke='black'
            strokeWidth='1px'
            fillOpacity='0'
          />
        )
      }</> : null}
      <circle
        r={outerRadius}
        cx={x}
        cy={y}
        fill={accessPoint.kind === 'Requester' ? color : 'white'}
        stroke='black'
        strokeWidth='1px'
      />
      <circle
        r={innerRadius}
        cx={x}
        cy={y}
        fill={accessPoint.kind === 'Responder' ? color : 'white'}
        stroke='black'
      />
    </>
  );
}