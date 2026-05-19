# 🏗 System Architecture: VSprint

## Tech Stack (May 2026)
- **Frontend:** React 19, Vite 6, TypeScript 5.8.
- **Styling:** Tailwind CSS 4+, Motion 12 (formerly Framer Motion).
- **Icons:** Lucide-React.
- **AI Engine:** Google GenAI SDK (`gemini-2.0-flash` primary).
- **Backend/DB:** Supabase (Auth, Postgres, Storage).
- **Deployment:** Netlify (CI/CD, CDN).

## Core Components
- `App.tsx`: Central orchestrator, auth state, and AI fetch loop.
- `InteractionItem.tsx`: High-fidelity rendering of AI responses (Typing effect, tabbed code views).
- `LivePreview.tsx`: Sandboxed iframe for real-time code execution.
- `Sidebar.tsx`: Persistent conversation history and user settings.
- `BackgroundSystem.tsx`: Aesthetic "vibe" layer for depth.

## Data Model (Supabase)
- `interactions`: Stores prompts, AI responses (JSON), and conversation IDs.
- `profiles`: User-specific metadata (Avatar, preferences).
- `app-files`: Storage bucket for user-uploaded assets.

## System Invariants
- **Schema-First AI:** All AI responses must conform to the strict JSON schema defined in `App.tsx`.
- **Fallback Reliability:** Model calls MUST have a secondary fallback (2.0 Flash -> 1.5 Pro).
- **Sandbox Security:** User-generated code must ONLY run within the `LivePreview` iframe with appropriate sandbox attributes.
