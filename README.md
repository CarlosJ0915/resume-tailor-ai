# AI Resume Tailor

Paste a resume and a job description; get the resume's bullet points rewritten to better match the job, powered by Claude (Anthropic API).

## Structure

```
client/   React + Vite frontend
server/   Node + Express backend (talks to the Anthropic API)
```

The backend exists so the API key never reaches the browser.

## Getting started

**1. Server**

```bash
cd server
cp .env.example .env
# edit .env and add your ANTHROPIC_API_KEY
npm run dev
```

Runs on http://localhost:3001

**2. Client** (in a second terminal)

```bash
cd client
npm run dev
```

Runs on http://localhost:5173

## Getting an API key

Create one at https://console.anthropic.com/settings/keys
