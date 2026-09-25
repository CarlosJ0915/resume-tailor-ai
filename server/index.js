// AI Resume Tailor - Server
//
// What this file needs to do:
// 1. Load environment variables (your API key) from .env
// 2. Set up an Express app with CORS and JSON body parsing
// 3. Create a POST route, e.g. /api/tailor, that:
//    - reads `resume` and `jobDescription` from req.body
//    - validates both are present (return 400 if not)
//    - sends them to the Anthropic API with a prompt asking it to
//      tailor the resume to the job description
//    - returns the AI's response as JSON
// 4. Start the server listening on a port (use process.env.PORT)
//
// Packages already installed for you: express, cors, dotenv, @anthropic-ai/sdk
// Docs: https://docs.anthropic.com/en/api/messages
