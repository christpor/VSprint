# 🧠 VSprint Project Instructions (May 2026)

## 🎯 Core Mission
VSprint is an elite, high-density coding coach designed for rapid skill acquisition. It prioritizes "The Why" behind "The How" and uses modern 2026 AI models to deliver instant, visually stunning code solutions.

## ⚡️ AI Architecture
- **Primary Model:** `gemini-3.0-flash` (The 2026 Speed King).
- **Fallback Model:** `gemini-2.0-flash` (Zero-failure backup).
- **System Role:** "The VSprint Coach" – Senior Developer mentor persona.

## 🛠 Engineering Standards
- **Vibe Coding:** Maintain high-fidelity UI (Tailwind 4+, motion) and surgical code edits.
- **Frontend:** React 19, Vite 6, Motion 12.
- **Backend:** Supabase Auth (Google OAuth) and Postgres storage.
- **Reliability:** Implement automatic fallbacks for all AI model calls.

## 🧭 Navigation
- `/src/App.tsx`: Main application logic and AI fetch loop.
- `/src/components`: Refactored modular UI components.
- `/src/services`: Supabase and AI integration layers.
