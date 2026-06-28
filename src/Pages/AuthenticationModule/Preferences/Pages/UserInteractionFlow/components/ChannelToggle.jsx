export default function ChannelToggle({ value, onChange }) {
  return (
    <div style={{ position: "absolute", top: 20, right: 20 }}>
      <label>
        <input type="radio" checked={value === "all"} onChange={() => onChange("all")} />
        All
      </label>
      {" "}
      <label>
        <input type="radio" checked={value === "sms"} onChange={() => onChange("sms")} />
        SMS
      </label>
    </div>
  );
}
