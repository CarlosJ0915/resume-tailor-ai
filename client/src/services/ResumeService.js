const BASE_REST_API_URL = "http://localhost:3001/api";

export const tailorResume = async (resume, jobDescription) => {
  const res = await fetch(`${BASE_REST_API_URL}/tailor`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resume, jobDescription }),
  });

  if (!res.ok) {
    throw new Error("Request failed");
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
    throw new Error ("Upload failed");
  }

  const data = await res.json();
  return data.resumeText;
};