// src/components/blocks/TextBlock.js
import { useState } from "react";

function TextBlock() {
  const [text, setText] = useState("Edit me...");

  return (
    <div className="text-block">
      <textarea value={text} onChange={(e) => setText(e.target.value)} />
    </div>
  );
}

export default TextBlock;

 
