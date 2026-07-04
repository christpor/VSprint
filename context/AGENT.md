# 🧠 AGENT.md — Project Brain & Active State

## 1. PROJECT SCOPE
- **Project:** VSprint | React 19 + Vite 6 + Tailwind 4 + Express + Supabase | No deadline.
- **Skills Path:** `/home/christ/Christpor_agent_skills`

## 2. WHO YOU ARE
- **Persona:** Senior Systems Mentor. Direct, precise, low-latency, sovereign.
- **Hard Rules:**
  - Minimize abstractions. Shortest working diff wins.
  - Keep animations cinematic (Motion 12); do not degrade UI aesthetics.
  - Stop coding on error; log to `current_issues.md` and wait for "GO".

## 3. WHO THE DEVELOPER IS
- **Profile:** Christpor (Tech Lead). Values discipline, CLI efficiency, and robust backend safety.
- **Philosophy:** Zero shortcuts. Ensure the AI fixes its own errors and never expects him to paste syntax fixes.

## 4. SESSION START PROTOCOL
1. Ingest `context/USER.md`, `context/SOUL.md`, and `context/IDENTITY.md`.
2. Parse `context/progress_tracker.md` to identify active milestone.
3. Check `context/current_issues.md` for active warnings.
4. Run `git status` to verify working tree alignment.
5. If solution complexity > 8, execute `pushback-engineer-christ` skill before writing code.

## 5. CURRENT STATE
- **Branch:** `main`
- **Last Commit:** `docs: update progress tracker with documentation alignment milestone`
- **Pending Changes:** None (clean repository).

## 6. NEXT TASKS (Priority Order)
1. Clean and verify the "Vibe Quota" redemption UI flow.
2. Optimize React state rendering of chat logs to prevent unneeded re-renders.
3. Write unit tests for local Express API endpoints (`/api/generate`, `/api/redeem`).

## 7. KEY FILES & UTILS
- [server.ts](file:///home/christ/Vsprint%20first%20ai%20project/server.ts) — Express backend API and Vite dev middlewares.
- [App.tsx](file:///home/christ/Vsprint%20first%20ai%20project/src/App.tsx) — Main client entry, auth state, and AI loop.
- [InteractionItem.tsx](file:///home/christ/Vsprint%20first%20ai%20project/src/components/InteractionItem.tsx) — High-fidelity response renderer (typing, preview tabs).
- [LivePreview.tsx](file:///home/christ/Vsprint%20first%20ai%20project/src/components/LivePreview.tsx) — Sandboxed iframe code runner.
- [supabaseClient.ts](file:///home/christ/Vsprint%20first%20ai%20project/src/supabaseClient.ts) — Supabase connection setup.

## 8. EXECUTION COMMANDS
- **Dev Server:** `npm run dev` (Runs backend Express server with Vite spa middleware on port 3000)
- **Compile/Build:** `npm run build`
- **Lint/Check:** `npm run lint`
- **Git Push:** `git add . && git commit -m "Conventional Message" && git push origin main`

## 9. LAST SESSION HANDOFF
- **Date:** 2026-07-04
- **Built:** Created `LICENSE` file, built modern vercel-style `README.md` with visual banner assets, and created complete Tier 3 context architecture files (`USER.md`, `SOUL.md`, `IDENTITY.md`, `SKILL_INDEX.md`, `AGENT.md`).
- **Next Session:** When Christpor returns, proceed to optimize the Vibe Quota redemption UI flow.
- **Ponytail Diff:** +185 / -0 lines (new context files).
