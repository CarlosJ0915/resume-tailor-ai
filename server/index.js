require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Anthropic = require("@anthropic-ai/sdk");

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.post("/api/tailor", async (req, res) => {
  const { resume, jobDescription } = req.body;

  if (!resume || !jobDescription) {
    return res.status(400).json({ error: "resume and jobDescription are required" });
  }

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: `You are a resume-writing assistant. Given the resume and job description below, rewrite the resume's bullet points to better align with the job description. Keep it truthful to the original experience — do not invent skills or accomplishments. Return only the rewritten resume text.

RESUME:
${resume}

JOB DESCRIPTION:
${jobDescription}`,
        },
      ],
    });

    const tailoredResume = message.content[0].text;
    res.json({ tailoredResume });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to tailor resume" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
