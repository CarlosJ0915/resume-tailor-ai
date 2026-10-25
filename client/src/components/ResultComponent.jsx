import { useState } from "react";
import { CheckIcon, CopyIcon } from "./Icons";

const ResultComponent = ({ tailoredResume, loading }) => {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(tailoredResume);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setCopyFailed(true);
      setTimeout(() => setCopyFailed(false), 2000);
    }
  }

  if (loading) {
    return (
      <div className="result" aria-busy="true">
        <div className="result-header">
          <h3>Tailored resume</h3>
          <span className="status-pill">
            <span className="spinner spinner-sm" /> Writing &amp; reviewing
          </span>
        </div>
        <div className="skeleton-lines">
          {[92, 78, 85, 60, 88, 70].map((w, i) => (
            <span key={i} className="skeleton" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (!tailoredResume) return null;

  return (
    <div className="result reveal">
      <div className="result-header">
        <h3>Tailored resume</h3>
        <button type="button" className={`btn-secondary btn-sm${copied ? " is-success" : ""}`} onClick={handleCopy}>
          {copied ? <CheckIcon width={16} height={16} /> : <CopyIcon width={16} height={16} />}
          {copied ? "Copied" : copyFailed ? "Copy failed" : "Copy"}
        </button>
      </div>
      <pre>{tailoredResume}</pre>
    </div>
  );
};

export default ResultComponent;
