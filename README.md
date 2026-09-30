# AI Resume Tailor

A full-stack web app that rewrites a resume to better match a specific job description, using Google's Gemini API. Upload a resume (PDF or Word) or paste it in, paste a job posting, and get back:

- A tailored version of the resume, ready to copy
- A **match rating** (0–100%) from a separate scoring pass, showing how well it lines up with the job
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
3. The server runs an **agent loop** (below) that rewrites the resume, scores it, and revises it until the score is good enough or it runs out of passes.
4. The frontend shows the rewritten resume in a result card with a Copy button, and the score, keywords, and feedback in the Match rating sidebar.

The API key lives only on the server, so it never reaches the browser.

## The agent loop

The first version made a single Gemini call that wrote the resume and scored it at the same time. That meant the score was the writer grading its own work, so it was close to meaningless.

Each pass is now two separate calls:

1. **Writer** — rewrites the resume against the job description. On later passes it also receives the judge's score and feedback from the previous attempt.
2. **Judge** — a separate call that only scores the rewritten text, returning a 0–100 score, matched keywords, and short feedback.

The loop stops when the score reaches **85** or after **3 passes**, whichever comes first. It returns the **highest-scoring pass**, not the last one — revisions don't reliably beat the attempt before them. Three runs on identical input:

| Run | Pass 1 | Pass 2 | Pass 3 | Kept |
| --- | ------ | ------ | ------ | ---- |
| 1   | 68     | 75     | 75     | pass 2 (75) |
| 2   | 68     | 88     | —      | pass 2 (88) |
| 3   | 72     | 75     | 85     | pass 3 (85) |

Run 1 never converged. That's why best-of beats last-one.

Model responses are also parsed defensively: `parseModelJson` strips code fences and pulls the JSON object out of any surrounding prose, and `askModel` retries once. Before that, one malformed response threw from `JSON.parse` and turned the whole request into a 500.

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
| POST   | `/api/tailor`        | JSON `{ resume, jobDescription }`      | `{ tailoredResume, matchScore, keywords, feedback, passes, selectedPass }` |

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
- **Building an agent loop:** separating the writer from the judge, feeding critique back in, choosing a stopping condition, and learning that more passes don't automatically mean a better result.
- **Debugging real integration issues:** a Gemini model being deprecated, free-tier `503` overload errors, and a breaking API change between pdf-parse v1 and v2.
- **React details:** controlled inputs, the Rules of Hooks (hooks before early returns), rendering lists with `key`, and resetting a file input so the same file can be picked twice.

## Known limitations

- **The AI can still overstate experience.** The prompt tells Gemini not to invent skills, but it sometimes adds claims the original resume doesn't make — usually by lifting phrases straight out of the job posting, since the judge rewards keyword overlap and nothing penalizes padding. Always review the output.
- **The score is noisy.** Pass 1 scored 68, 68, and 72 on identical input, so the 85 threshold is fuzzier than it looks and a run can pass or fail partly on chance. Scoring each pass several times and taking the median would help.
- **The loop doesn't always converge.** It can plateau below the threshold and spend its remaining passes without improving.
- **Free-tier API availability.** Gemini's free tier sometimes returns `503 Service Unavailable` during high demand. `askModel` retries once, which isn't enough for a sustained outage.
- **Local only.** The app needs the Express server running, so it isn't deployed as a static site. There's also no rate limiting or upload size limit yet.
