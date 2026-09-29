import { useState } from "react";
import { tailorResume, uploadResume } from "../services/ResumeService";
import ResultComponent from "./ResultComponent";
import MatchRatingComponent from "./MatchRatingComponent";

const ResumeFormComponent = () => {
  const [resume, setResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [tailoredResume, setTailoredResume] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [matchData, setMatchData] = useState(null);
  const [fileName, setFileName] = useState("");

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

  async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);

    try {
      const text = await uploadResume(file);
      setResume(text);
    } catch (err) {
      setError("Failed to read file. Please try again.");
    }
    e.target.value = "";
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
              <label htmlFor="resume">Resume</label>
              <span className="hint">Paste text or upload file</span>
            </div>
            <textarea
              id="resume"
              value={resume}
              onChange={(e) => setResume(e.target.value)}
              placeholder="Paste your resume here"
            ></textarea>
              <div className="upload-row">
                <input
                id="resume-file"
                className="file-input"
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileUpload}
                />
                <label htmlFor="resume-file" className="btn-secondary upload-btn">
                  Upload PDF or Word
                </label>
                <span className="hint">{fileName || "No file chosen"}</span>
              </div>
          </div>

          <div className="field">
            <div className="field-header">
              <label htmlFor="jobDescription">Job Description</label>
              <span className="hint">Paste job description</span>
            </div>
            <textarea
              id="jobDescription"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste your job description here"
            ></textarea>
          </div>

          <div className="actions">
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? "Tailoring..." : "Tailor my Resume"}
            </button>
            <button type="button" className="btn-secondary" onClick={handleClear}>Clear</button>
          </div>
        </form>

        {error && <p className="error">{error}</p>}
        <ResultComponent tailoredResume={tailoredResume} />
      </div>

      <aside className="sidebar">
        <MatchRatingComponent matchData={matchData} />
      </aside>
    </div>
  );

  
};



export default ResumeFormComponent;
