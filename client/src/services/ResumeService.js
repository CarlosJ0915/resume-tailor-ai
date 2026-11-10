// Set VITE_API_URL in client/.env.production to point the deployed site at the hosted server.
const BASE_REST_API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// The free hosting tier sleeps when idle; ping it on page load so it is
// awake by the time the visitor has pasted their resume.
export const wakeServer = () => {
  fetch(`${BASE_REST_API_URL}/health`).catch(() => {});
};

export const tailorResume = async (resume, jobDescription) => {
  const res = await fetch(`${BASE_REST_API_URL}/tailor`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resume, jobDescription }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Request failed");
  }

  const data = await res.json();
  return data;
};

export const uploadResume = async (file) => {
  //body goes here
  const formData = new FormData();
  formData.append("resume", file);

  const res = await fetch(`${BASE_REST_API_URL}/upload-resume`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Upload failed");
  }

  const data = await res.json();
  return data.resumeText;
};