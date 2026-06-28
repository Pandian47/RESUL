import { useState } from 'react';
function UrlLink() {
  const [label, setLabel] = useState("Click me");
  const [url, setUrl] = useState("https://example.com");

  return (
    <div className="url-link">
      <input
        type="text"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Enter link text"
      />
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter URL"
      />
      <a href={url} target="_blank" rel="noopener noreferrer">
        {label}
      </a>
    </div>
  );
}

export default UrlLink;
