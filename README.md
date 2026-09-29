# AI Resume Tailor

A full-stack web app that rewrites a resume to better match a specific job description, using Google's Gemini API. Upload a resume (PDF or Word) or paste it in, paste a job posting, and get back:

- A tailored version of the resume, ready to copy
- A **match rating** (0–100%) showing how well it lines up with the job
- The job's key skills that the resume matches
- Short feedback on strengths and what could be improved

<!-- Add a screenshot here: drag an image into this file on GitHub, or save one as docs/screenshot.png and use ![AI Resume Tailor](docs/screenshot.png) -->

## Tech stack

| Layer    | Tools                                                        |
| -------- | ------------------------------------------------------------ |
| Frontend | React, Vite, CSS (Grid, Flexbox)                             |
| Backend  | Node.js, Express                                             |
| AI       | Google Gemini API (`@google/generative-ai`), JSON output mode |
| Files    | Multer (uploads), pdf-parse (PDF), Mammoth (Word `.docx`)    |

## How it works

1. **Upload or paste a resume.** Uploaded files go to the server, which extracts plain text from the PDF or Word file and sends it back to fill in the resume box.
2. **Paste a job description** and click **Tailor my Resume**.
3. The server sends both to Gemini with a prompt that asks for structured JSON: the rewritten resume, a match score, matched keywords, and feedback. Gemini's JSON mode keeps the response machine-readable.
4. The frontend shows the rewritten resume in a result card with a Copy button, and the score, keywords, and feedback in the Match rating sidebar.

The API key lives only on the server, so it never reaches the browser.

## Project structure

```
client/                         React + Vite frontend
  src/
    App.jsx                     Page layout
    components/
      HeaderComponent.jsx       Title and subtitle
      ResumeFormComponent.jsx   Form, file upload, and app state
      ResultComponent.jsx       Tailored resume + copy button
      MatchRatingComponent.jsx  Score ring, keywords, feedback
    services/
      ResumeService.js          API calls to the backend
server/                         Node + Express backend
  index.js                      Routes, file parsing, Gemini calls
```

## API

| Method | Route                | Body                                   | Returns                                                  |
| ------ | -------------------- | -------------------------------------- | -------------------------------------------------------- |
| POST   | `/api/upload-resume` | `multipart/form-data` with a `resume` file (PDF or `.docx`) | `{ resumeText }`                                          |
| POST   | `/api/tailor`        | JSON `{ resume, jobDescription }`      | `{ tailoredResume, matchScore, keywords, feedback }`     |

## Running it locally

You need [Node.js](https://nodejs.org) and a free Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey).

**1. Start the server**

```bash
cd server
npm install
cp .env.example .env
```

Open `server/.env` and replace `your-api-key-here` with your Gemini API key. Then:

```bash
npm run dev
```

The server runs on http://localhost:3001.

**2. Start the client** (in a second terminal)

```bash
cd client
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173). Both terminals need to stay running.

## What I learned

- **Designing a small client/server app:** keeping the API key server-side, splitting the React code into components and a service layer, and defining a JSON contract between frontend and backend.
- **Getting structured output from an LLM:** using Gemini's JSON mode plus a strict prompt so the response can be parsed reliably, instead of scraping free-form text.
- **Handling file uploads:** `multipart/form-data` with `FormData` on the client and Multer on the server, then extracting text from PDF and Word files.
- **Debugging real integration issues:** a Gemini model being deprecated, free-tier `503` overload errors, and a breaking API change between pdf-parse v1 and v2.
- **React details:** controlled inputs, the Rules of Hooks (hooks before early returns), rendering lists with `key`, and resetting a file input so the same file can be picked twice.

## Known limitations

- **The AI can still overstate experience.** The prompt tells Gemini not to invent skills, but it sometimes adds claims the original resume doesn't make. Always review the output.
- **Free-tier API availability.** Gemini's free tier sometimes returns `503 Service Unavailable` during high demand. Retrying later usually works; automatic retries aren't built in yet.
- **Local only.** The app needs the Express server running, so it isn't deployed as a static site. There's also no rate limiting or upload size limit yet.
