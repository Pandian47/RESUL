import { Handle, Position } from 'reactflow';
export default function AnalyticsNode({ data }) {
  const isSMS = data.channel === "sms";

  return (
    <div style={{
      padding: 10,
      minWidth: 160,
      borderRadius: 10,
      background: isSMS ? "#eef6ff" : "#fff",
      border: isSMS ? "2px solid #1e90ff" : "1px solid #ccc"
    }}>
      <Handle type="target" position={Position.Left} />
      <strong>{isSMS ? "📩 " : ""}{data.label}</strong>
      <div>{Math.round(data.count / 1000)}K</div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
