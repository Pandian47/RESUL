export default function FlowLegend() {
  return (
    <div style={{ position: "absolute", bottom: 20, left: 20, background: "#fff", padding: 10 }}>
      📩 SMS Source<br/>
      🟢 Low Drop-off<br/>
      🟡 Medium Drop-off<br/>
      🔴 High Drop-off<br/>
      🔥 Bold arrow = Highest Drop-off
    </div>
  );
}
