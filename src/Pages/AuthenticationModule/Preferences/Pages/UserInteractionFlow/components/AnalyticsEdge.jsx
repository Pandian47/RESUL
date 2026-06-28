import { getBezierPath } from 'reactflow';
export default function AnalyticsEdge({
  id, sourceX, sourceY, targetX, targetY, data
}) {
  const [path, labelX, labelY] = getBezierPath({
    sourceX, sourceY, targetX, targetY
  });

  return (
    <>
      <path
        id={id}
        d={path}
        stroke={data.color}
        strokeWidth={data.isHighest ? 4 : 2}
        fill="none"
        markerEnd="url(#arrow)"
      />
      <text x={labelX} y={labelY} textAnchor="middle" fontSize={12}>
        {data.conversion}%
      </text>
      <path d={path} stroke="transparent" strokeWidth={12}>
        <title>{`Drop-off: ${data.dropOff}%`}</title>
      </path>
    </>
  );
}


export const arrowMarker = (
  <marker
    id="arrow"
    viewBox="0 0 10 10"
    refX="10"
    refY="5"
    markerWidth="6"
    markerHeight="6"
    orient="auto"
  >
    <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
  </marker>
);