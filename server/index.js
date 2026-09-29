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
const upload = multer({ storage: multer.memoryStorage() });

//Google | Gemini API configuration
require("dotenv").config();
const { GoogleGenerativeAI } =
require ("@google/generative-ai");
const express = require("express");
const cors = require("cors");
const genAI = new
GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({model: "gemini-3.5-flash-lite",
generationConfig: {responseMimeType: "application/json"}
});

const app = express();
app.use(cors());
app.use(express.json());

// Upload document
app.post("/api/upload-resume",upload.single("resume"),
  async (req, res) => {
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
  

app.post("/api/tailor", async (req, res) => {
    const { resume, jobDescription } = req.body;
    if (!resume || !jobDescription) {
        return res.status(400).json({ error: "Resume and JobDescription are required" });
    }
    try {
    const prompt = `You are a resume assistant. Compare the resume to the job description and respond with JSON only, using exactly this shape:
    {
      "tailoredResume": string,
      "matchScore": number,
      "keywords": string[],
      "feedback": [{ "type": "good" | "improve", "text": string }]
    }
    
    Rules:
    - tailoredResume: rewrite the resume to better match the job. Plain text only, no markdown, no asterisks. Do not invent skills or experience.
    - matchScore: integer from 0 to 100 for how well the rewritten resume matches the job.
    - keywords: 3 to 6 short skills from the job description that the resume matches.
    - feedback: 2 to 4 short points. Use "good" for strengths and "improve" for suggestions.
    
    RESUME: 
    ${resume}
    JOB DESCRIPTION:
    ${jobDescription}`;
    const result = await model.generateContent(prompt);
    const data = JSON.parse(result.response.text());
    res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to tailor resume" });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

