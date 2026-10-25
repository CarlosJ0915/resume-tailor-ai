import { useState } from "react";
import { tailorResume, uploadResume } from "../services/ResumeService";
import ResultComponent from "./ResultComponent";
import MatchRatingComponent from "./MatchRatingComponent";
import { FileIcon, SparkleIcon, UploadIcon, XIcon } from "./Icons";

const wordCount = (text) => (text.trim() ? text.trim().split(/\s+/).length : 0);

const ResumeFormComponent = () => {
  const [resume, setResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [tailoredResume, setTailoredResume] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [matchData, setMatchData] = useState(null);
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const canSubmit = resume.trim() && jobDescription.trim() && !loading && !uploading;

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await tailorResume(resume, jobDescription);
      setTailoredResume(result.tailoredResume);
      setMatchData(result);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function processFile(file) {
    if (!file) return;
    setFileName(file.name);
    setUploading(true);
    setError("");

    try {
      const text = await uploadResume(file);
      setResume(text);
    } catch (err) {
      setError("Failed to read file. Please try again.");
      setFileName("");
    } finally {
      setUploading(false);
    }
  }

  async function handleFileUpload(e) {
    await processFile(e.target.files[0]);
    e.target.value = "";
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    processFile(e.dataTransfer.files[0]);
  }

  function handleClear() {
    setResume("");
    setJobDescription("");
    setTailoredResume("");
    setError("");
    setMatchData(null);
    setFileName("");
  }

  return (
    <div className="layout">
      <div className="main">
        <form className="form" onSubmit={handleSubmit}>
          <div className="field">
            <div className="field-header">
              <span className="field-step">1</span>
              <div className="field-title">
                <label htmlFor="resume">Your resume</label>
                <span className="hint">Paste the text or upload a file</span>
              </div>
            </div>

            <label
              htmlFor="resume-file"
              className={`dropzone${dragging ? " is-dragging" : ""}${uploading ? " is-uploading" : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              <input
                id="resume-file"
                className="file-input"
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileUpload}
              />
              <span className="dropzone-icon">
                {uploading ? <span className="spinner" /> : <UploadIcon />}
              </span>
              <span className="dropzone-text">
                {uploading ? (
                  <strong>Reading {fileName}…</strong>
                ) : (
                  <>
                    <strong>
                      Drop your resume here or <u>browse</u>
                    </strong>
                    <span className="hint">PDF or DOCX</span>
                  </>
                )}
              </span>
            </label>

            {fileName && !uploading && (
              <div className="file-chip">
                <FileIcon width={16} height={16} />
                <span>{fileName}</span>
                <button
                  type="button"
                  className="icon-btn"
                  aria-label="Remove file"
                  onClick={() => {
                    setFileName("");
                    setResume("");
                  }}
                >
                  <XIcon width={14} height={14} />
                </button>
              </div>
            )}

            <div className="divider">
              <span>or paste text</span>
            </div>

            <div className="textarea-wrap">
              <textarea
                id="resume"
                value={resume}
                onChange={(e) => setResume(e.target.value)}
                placeholder="Experience, skills, education…"
              ></textarea>
              <span className="counter">{wordCount(resume)} words</span>
            </div>
          </div>

          <div className="field">
            <div className="field-header">
              <span className="field-step">2</span>
              <div className="field-title">
                <label htmlFor="jobDescription">Job description</label>
                <span className="hint">Paste the full posting for the best results</span>
              </div>
            </div>
            <div className="textarea-wrap">
              <textarea
                id="jobDescription"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Responsibilities, requirements, nice-to-haves…"
              ></textarea>
              <span className="counter">{wordCount(jobDescription)} words</span>
            </div>
          </div>

          <div className="actions">
            <button className="btn-primary" type="submit" disabled={!canSubmit}>
              {loading ? (
                <>
                  <span className="spinner" /> Tailoring your resume…
                </>
              ) : (
                <>
                  <SparkleIcon /> Tailor my resume
                </>
              )}
            </button>
            <button type="button" className="btn-ghost" onClick={handleClear} disabled={loading}>
              Clear all
            </button>
          </div>
        </form>

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <ResultComponent tailoredResume={tailoredResume} loading={loading} />
      </div>

      <aside className="sidebar">
        <MatchRatingComponent matchData={matchData} loading={loading} />
      </aside>
    </div>
  );
};

export default ResumeFormComponent;
