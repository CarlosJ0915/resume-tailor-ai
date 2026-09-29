import { useState } from "react";

const ResultComponent = ({ tailoredResume }) => {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  
  async function handleCopy(){
    try {
    await navigator.clipboard.writeText(tailoredResume);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  } catch (err) {
    setCopyFailed(true);
    setTimeout(() => setCopyFailed(false), 2000);
  }
  }
  
  if (!tailoredResume) return null;

  return (
    <div className="result">
      <div className="field-header">
        <label>Tailored resume</label>
        <span className="hint">Ready to copy</span>
        </div>
      <pre>{tailoredResume}</pre>
      <div className="copy-row">
        <button type="button" className="btn-secondary" onClick={handleCopy}>
          {copied ? "Copied" : copyFailed ? "Copy failed" : "Copy"}
        </button>
      </div>
    </div>
  );
};

export default ResultComponent;
