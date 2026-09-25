import { useState } from "react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

function App() {
  const [resume, setResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [tailoredResume, setTailoredResume] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setTailoredResume("");

    try {
      const res = await fetch(`${API_URL}/api/tailor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, jobDescription }),
      });

      if (!res.ok) throw new Error("Request failed");

      const data = await res.json();
      setTailoredResume(data.tailoredResume);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <h1>AI Resume Tailor</h1>
      <p className="subtitle">
        Paste your resume and a job description — get bullet points rewritten
        to match.
      </p>

      <form onSubmit={handleSubmit} className="form">
        <div className="field">
          <label htmlFor="resume">Your Resume</label>
          <textarea
            id="resume"
            value={resume}
            onChange={(e) => setResume(e.target.value)}
            placeholder="Paste your resume text here..."
            rows={12}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="jobDescription">Job Description</label>
          <textarea
            id="jobDescription"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here..."
            rows={12}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Tailoring..." : "Tailor My Resume"}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {tailoredResume && (
        <div className="result">
          <h2>Tailored Resume</h2>
          <pre>{tailoredResume}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
