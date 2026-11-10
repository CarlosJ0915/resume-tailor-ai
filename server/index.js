// AI Resume Tailor - Server
//
// What this file needs to do:
// 1. Load environment variables (your API key) from .env
// 2. Set up an Express app with CORS and JSON body parsing
// 3. Create a POST route, e.g. /api/tailor, that:
//    - reads `resume` and `jobDescription` from req.body
//    - validates both are present (return 400 if not)
//    - sends them to the Gemini API with a prompt asking it to
//      tailor the resume to the job description
//    - returns the AI's response as JSON
// 4. Start the server listening on a port (use process.env.PORT)
//
// Packages already installed for you: express, cors, dotenv, @google/generative-ai
// Docs: https://ai.google.dev/gemini-api/docs/text-generation
//
// Get a free API key at: https://aistudio.google.com/apikey

//Document library needed with Multer
const multer = require("multer");
const { PDFParse } = require("pdf-parse");
const mammoth = require("mammoth");
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
});

//Google | Gemini API configuration
require("dotenv").config();
const { GoogleGenerativeAI } =
require ("@google/generative-ai");
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const genAI = new
GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({model: "gemini-3.5-flash-lite",
generationConfig: {responseMimeType: "application/json"}
});

const app = express();

// Render sits behind a proxy; without this every visitor shares one IP and
// the rate limiter would lock everyone out at once.
app.set("trust proxy", 1);

// Comma-separated list, e.g. "https://carlosj0915.github.io". Unset = allow
// any origin, which keeps local development working.
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
app.use(cors(allowedOrigins.length ? { origin: allowedOrigins } : undefined));
app.use(express.json({ limit: "100kb" }));

// Every tailor request costs up to six model calls, so cap how often one
// visitor can run it on a public demo.
const tailorLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: Number(process.env.TAILOR_LIMIT_PER_HOUR) || 10,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Too many requests. Please try again in an hour." },
});
const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 30,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Too many uploads. Please try again later." },
});

const MAX_INPUT_CHARS = 20000;

// Lets the frontend wake the free-tier server while the visitor is still typing.
app.get("/api/health", (req, res) => {
    res.json({ ok: true });
});

// Upload document
app.post("/api/upload-resume", uploadLimiter, upload.single("resume"),
  async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }
    try{
        let text;

        if(req.file.mimetype === "application/pdf"){
            // pdf parsing goes here
            const parser = new PDFParse({ data: req.file.buffer });
            const result = await parser.getText();
            text = result.text;
        } else if (req.file.mimetype === 
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
                // docx parsing goes here
                const result = await mammoth.extractRawText({ buffer:  
                req.file.buffer });
                text = result.value;
            } else {
                return res.status(400).json({ error: "Unsupported file tpye" });
            }
    
    res.json({ resumeText: text });
  } catch (err){
    console.error(err)
    res.status(500).json({ error: "Failed to parse file" });
  }
  });
  

// --- Agent loop ---------------------------------------------------------
// One pass = write, then judge. If the judge is not satisfied we feed its
// feedback back into the writer and go again. Stops on a passing score or
// after MAX_PASSES, and returns the best pass rather than the last one.

const PASS_SCORE = 85;
const MAX_PASSES = 3;

// The model sometimes wraps JSON in code fences or trails a sentence after
// it, which made JSON.parse throw and turn the whole request into a 500.
function parseModelJson(raw) {
    const cleaned = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "");
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end === -1) {
        throw new Error("No JSON object in model response");
    }
    return JSON.parse(cleaned.slice(start, end + 1));
}

// One bad response should cost a retry, not the request.
async function askModel(prompt, attempts = 2) {
    let lastErr;
    for (let i = 0; i < attempts; i++) {
        try {
            const result = await model.generateContent(prompt);
            return parseModelJson(result.response.text());
        } catch (err) {
            lastErr = err;
            console.warn(`Model call failed (attempt ${i + 1}/${attempts}): ${err.message}`);
        }
    }
    throw lastErr;
}

// Step 1: write. `critique` is empty on the first pass.
async function writeResume(resume, jobDescription, critique) {
    const revision = critique
        ? `A reviewer scored your previous attempt ${critique.matchScore}/100 and said:
${critique.feedback.map((f) => `- ${f.text}`).join("\n")}

Rewrite it again, addressing those points. Previous attempt:
${critique.tailoredResume}`
        : "";

    const prompt = `You are a resume writer. Rewrite the resume so it matches the job description.
Respond with JSON only, using exactly this shape:
{ "tailoredResume": string }

Rules:
- Plain text only, no markdown, no asterisks.
- Do not invent skills, employers, dates, or experience. Work only with what the resume already contains.
- Keep it the same length or shorter.

RESUME:
${resume}

JOB DESCRIPTION:
${jobDescription}

${revision}`;

    const data = await askModel(prompt);
    if (!data.tailoredResume) throw new Error("Writer returned no resume");
    return data.tailoredResume;
}

// Step 2: judge. Separate call, so it scores the text rather than scoring
// its own work in the same breath it wrote it.
async function scoreResume(tailoredResume, jobDescription) {
    const prompt = `You are a hiring screener. Score how well this resume matches the job description.
Respond with JSON only, using exactly this shape:
{
  "matchScore": number,
  "keywords": string[],
  "feedback": [{ "type": "good" | "improve", "text": string }]
}

Rules:
- matchScore: integer 0 to 100. Be strict; reserve above 90 for a genuinely strong match.
- keywords: 3 to 6 short skills from the job description that this resume actually demonstrates.
- feedback: 2 to 4 short points. "good" for strengths, "improve" for what is still missing.
- If the resume claims anything not supported by real experience, say so in an "improve" point.

RESUME:
${tailoredResume}

JOB DESCRIPTION:
${jobDescription}`;

    const data = await askModel(prompt);
    if (typeof data.matchScore !== "number") throw new Error("Judge returned no score");
    return {
        matchScore: data.matchScore,
        keywords: data.keywords || [],
        feedback: data.feedback || [],
    };
}

app.post("/api/tailor", tailorLimiter, async (req, res) => {
    const { resume, jobDescription } = req.body;
    if (!resume || !jobDescription) {
        return res.status(400).json({ error: "Resume and JobDescription are required" });
    }
    if (resume.length > MAX_INPUT_CHARS || jobDescription.length > MAX_INPUT_CHARS) {
        return res.status(413).json({ error: "Resume or job description is too long" });
    }

    try {
        let best = null;
        let critique = null;
        const history = [];

        for (let pass = 1; pass <= MAX_PASSES; pass++) {
            const tailoredResume = await writeResume(resume, jobDescription, critique);
            const judged = await scoreResume(tailoredResume, jobDescription);
            const attempt = { pass, tailoredResume, ...judged };

            history.push({ pass, matchScore: judged.matchScore });
            console.log(`Pass ${pass}: scored ${judged.matchScore}`);

            // Revisions do not reliably improve on the previous pass, so keep
            // the highest scorer instead of whatever came out last.
            if (!best || judged.matchScore > best.matchScore) {
                best = attempt;
            }

            if (judged.matchScore >= PASS_SCORE) break;
            critique = attempt;
        }

        res.json({
            tailoredResume: best.tailoredResume,
            matchScore: best.matchScore,
            keywords: best.keywords,
            feedback: best.feedback,
            passes: history,
            selectedPass: best.pass,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to tailor resume" });
    }
});

// Multer rejects oversized files by throwing; answer with JSON instead of an HTML error page.
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(413).json({ error: "File is too large (max 5 MB)" });
    }
    next(err);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

