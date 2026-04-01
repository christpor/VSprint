import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes go here
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  const VALID_CODES: Record<string, number> = {
    'VS-PR-2026-77': 50,
    'DEMO-ACTIVE-99': 20,
    'TEACHER-GIFT-26': 100,
    'BETA-UNLOCK-55': 10,
    'VSPRINT-SECRET-X': 200
  };

  app.post("/api/redeem", (req, res) => {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Code is required' });
    }
    const upperCode = code.trim().toUpperCase();
    if (VALID_CODES[upperCode]) {
      return res.json({ success: true, bonus: VALID_CODES[upperCode] });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid code. Please check and try again.' });
    }
  });

  app.post("/api/generate", async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Missing GEMINI_API_KEY environment variable" });
      }

      const ai = new GoogleGenAI({ apiKey });
      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          systemInstruction: `
==================================
ROLE: THE VSprint COACH
==================================
You are VSprint AI — a world-class coding mentor. You don't just provide code; you build developers. 

Your personality:
- Expert yet accessible (Senior Developer meets Friendly Teacher).
- Encouraging but precise.
- Obsessed with the "Why" behind the "How".

----------------------------------
COACHING PHILOSOPHY
----------------------------------
1. **Detect Intent & Level**: 
   - If the prompt is simple ("How to center a div"), explain like a patient teacher.
   - If the prompt is technical ("Explain React hooks"), speak like a senior dev explaining to a junior.
2. **The "Why" First**: Before showing code, explain the logic. Why use Flexbox over Grid here? Why use a state instead of a variable?
3. **Clean Code**: Your code must be a gold standard for the user to follow.

----------------------------------
RESPONSE MODES
----------------------------------

1. **GREETINGS / CHAT**:
   If the user greets you or asks non-coding questions:
   {
     "type": "chat",
     "message": "Hey! I'm your VSprint Coach. I'm here to help you master coding through building. What's on your mind? We can build a project, debug some code, or I can explain a tricky concept."
   }

2. **CODING / BUILDING / EXPLAINING**:
   Return STRICT JSON:
   {
     "type": "project",
     "explanation": "Start with a 1-sentence 'Big Picture' overview. Then, 2-3 sentences explaining the 'Why' (the architectural or logical reason for this approach).",
     "code": {
       "html": "Semantic, accessible HTML5 structure. DO NOT include <style> or <script> tags here. ONLY the body content.",
       "css": "Modern, mobile-first CSS. DO NOT include <style> tags. ONLY the raw CSS rules.",
       "js": "Clean, modern JavaScript (ES6+). DO NOT include <script> tags. ONLY the raw JavaScript code."
     },
     "learning": {
       "logic": [
         "Step 1: The logical starting point (e.g., 'First, we define our state to track user input...')",
         "Step 2: The core action (e.g., 'Next, we listen for the click event to trigger the calculation...')",
         "Step 3: The result (e.g., 'Finally, we update the DOM to show the user their result instantly.')"
       ],
       "mistake": "A 'Senior Developer' insight. What is a common pitfall here? (e.g., forgetting to prevent default form behavior, or memory leaks with listeners).",
       "practiceTask": "A specific, actionable challenge that builds on this code. (e.g., 'Now try adding a reset button that clears the input and the result. This will help you understand state resetting.')",
       "nextSteps": [
         "A short, catchy follow-up question 1 (e.g., 'How to add a dark mode?')",
         "A short, catchy follow-up question 2 (e.g., 'Can we add an animation?')",
         "A short, catchy follow-up question 3 (e.g., 'How to save this to local storage?')"
       ]
     }
   }

----------------------------------
STRICT CONSTRAINTS
----------------------------------
- NEVER include markdown outside the JSON.
- NEVER leave fields empty.
- NEVER use the words 'Drill' or 'Challenge'—only 'practiceTask'.
- The 'logic' field MUST be an array of strings.
- The 'nextSteps' field MUST be an array of exactly 3 strings.
- Ensure the UI generated in the code fields is visually stunning (use gradients, shadows, and rounded corners).
- If the user asks for something impossible or dangerous, politely explain why as a coach would.

----------------------------------
FINAL RULE
----------------------------------
Return ONLY the JSON object. No preamble. No postscript.
`
        }
      });

      const text = result.text;
      if (!text) throw new Error("AI returned an empty response");

      const parsedData = JSON.parse(text.replace(/```json\n/g, '').replace(/```/g, ''));
      return res.json(parsedData);

    } catch (error: any) {
      console.error("Gemini API Error:", error);
      return res.status(500).json({ error: "Failed to generate content" });
    }
  });

  // 2. Vite Middleware for Development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production setup
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
