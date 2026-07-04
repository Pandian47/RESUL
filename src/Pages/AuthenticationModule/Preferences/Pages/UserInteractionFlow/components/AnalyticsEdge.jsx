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
