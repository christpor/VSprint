# 🧠 AGENT.md — Project Brain & Active State

## 1. PROJECT SCOPE
- **Project:** VSprint | React 19 + Vite 6 + Tailwind 4 + Express + Firebase Auth + Supabase (data) | Portfolio project.
- **Skills Path (Mac):** `/Users/anbschool0023/Documents/Agents skills/christpor_agent_skills`
- **Repo:** `https://github.com/christpor/VSprint.git`
- **Live (Netlify):** Connected to `main` branch. Do NOT push to main without Christpor's approval.

## 2. WHO YOU ARE
- **Persona:** Senior Systems Mentor. Direct, precise, low-latency, sovereign.
- **Hard Rules:**
  - Minimize abstractions. Shortest working diff wins.
  - Keep animations cinematic (Motion 12); do not degrade UI aesthetics.
  - Stop coding on error; log to `current_issues.md` and wait for "GO".
  - Speak casually ("bro", "man") — match Christpor's energy.

## 3. WHO THE DEVELOPER IS
- **Profile:** Christpor Rin (Tech Lead). Values discipline, CLI efficiency, and robust backend safety.
- **Philosophy:** Zero shortcuts. Ensure the AI fixes its own errors and never expects him to paste syntax fixes.
- **Portfolio context:** This is a project built in his first 2 weeks of coding — being improved for portfolio submission.

## 4. SESSION START PROTOCOL
1. Read this `context/AGENT.md` file first.
2. Run `git status` and `git branch` to confirm branch alignment.
3. Check if `npm run dev` is running (port 3000).
4. Review section 6 (NEXT TASKS) to know what to work on.
5. If switching computers — ensure `.env` has `GEMINI_API_KEY`.

## 5. CURRENT STATE
- **Branch:** `develop` (DO NOT merge to main without approval)
- **Last Commit:** `feat: migrate auth from Supabase to Firebase Auth`
- **Pending Changes:** None (clean tree, all committed).
- **Firebase Project:** `vsprint-app` (Project ID: vsprint-app)
- **Firebase App ID:** `1:305778193794:web:55aaea5a87cbe9f4a10b9b`

### Commit History (develop, newest first):
```
2453d6d feat: migrate auth from Supabase to Firebase Auth
64569c1 feat: add React Router, split app into pages, redesign hero
d6412bb feat: add CinematicHero component (video background + liquid glass UI)
d8b89c3 feat: add custom AI-generated background video (particles on white)
4b698df feat: add transparent robot mascot video assets for all sections
```

### Architecture Changes Made This Session:
| Before | After |
|--------|-------|
| Single-page App.tsx (~1500 lines) | Split into pages: LandingPage, AboutPage, ChatPage |
| No routing | React Router: `/`, `/about`, `/app` |
| Spline 3D robot (heavy, ~2MB) | Transparent video mascot (5 videos, ~400KB each) |
| BackgroundSystem (animated purple blobs) | Clean white→sky gradient + mouse-follow glow |
| Supabase Auth | Firebase Auth (email/password + Google OAuth) |
| Supabase for everything | Firebase Auth + Supabase for data storage |

## 6. NEXT TASKS (Priority Order) ⚠️ INCOMPLETE
1. **Enable Firebase Auth providers** — User must enable Email/Password + Google in Firebase Console: `https://console.firebase.google.com/project/vsprint-app/authentication/providers`
2. **Test full auth flow** — Sign up → Log in → Access /app → Use AI chat
3. **Build AuthModal component** — Popup when unauth user tries to use features (smart gating: let them SEE the app but auth pops up when they try to DO something)
4. **Fix /app access** — Currently redirects to `/` if not logged in. Change to: show the page but trigger auth modal when user tries to send a message.
5. **Push develop to GitHub** — `git push -u origin develop` (after auth is tested)
6. **Merge to main** — ONLY after Christpor approves

### Blocked:
- Firebase Auth won't work until providers are enabled in the console (Step 1 above)

## 7. KEY FILES & ARCHITECTURE
```
src/
├── firebaseClient.ts        — Firebase init + auth + GoogleAuthProvider
├── supabaseClient.ts        — Supabase client (data only, NOT auth)
├── App.tsx                  — Shared state, routing, navbar, theme, mouse effects
├── main.tsx                 — BrowserRouter wrapper
├── pages/
│   ├── LandingPage.tsx      — Hero + How It Works + Features + About + Footer
│   ├── AboutPage.tsx        — Dedicated about page with robot
│   └── ChatPage.tsx         — AI chat tool (requires auth)
├── components/
│   ├── LogIn.tsx            — Firebase signInWithEmailAndPassword + Google popup
│   ├── SignUp.tsx           — Firebase createUserWithEmailAndPassword + Google popup
│   ├── ProfileAvatar.tsx    — User avatar (uses Firebase user.photoURL)
│   ├── CinematicHero.tsx    — Experimental video hero (unused, kept for reference)
│   ├── InteractionItem.tsx  — Chat response renderer
│   ├── LivePreview.tsx      — Sandboxed iframe code runner
│   ├── Sidebar.tsx          — Chat history sidebar
│   ├── VSprintLogo.tsx      — Logo component
│   └── BackgroundSystem.tsx — (DEPRECATED, replaced by CSS gradient)
├── services/
│   ├── profileService.ts    — Supabase profiles table + avatar storage
│   └── interactionService.ts — Supabase interactions table (CRUD)
└── types.ts                 — Shared TypeScript types
public/
├── robot_hero.webm          — Waving robot (hero section)
├── robot_howitworks.webm    — Reading robot (How It Works)
├── robot_features.webm      — Typing robot (Features)
├── robot_about.webm         — Thumbs up robot (About)
├── robot_footer.webm        — Jumping robot (Footer)
├── vsprint_bg.webm          — Particles background video
└── vsprint_bg.mp4           — Background video (Safari fallback)
```

## 8. EXECUTION COMMANDS
- **Dev Server:** `npm run dev` (Express + Vite SPA middleware, port 3000)
- **Compile/Build:** `npm run build`
- **Lint/Check:** `npm run lint` (or `npx tsc --noEmit`)
- **Git Push (develop):** `git push -u origin develop`
- **Switch to main:** `git checkout main && git merge develop`
- **Firebase Console:** `https://console.firebase.google.com/project/vsprint-app/overview`

## 9. ENV REQUIREMENTS
```bash
# .env (required for dev server)
GEMINI_API_KEY=<your-gemini-api-key>
```
Firebase config is hardcoded in `src/firebaseClient.ts` (public keys, safe for client).
Supabase URL + anon key are hardcoded in `src/supabaseClient.ts`.

## 10. LAST SESSION HANDOFF
- **Date:** 2026-07-21
- **Who:** Christpor + Kiro CLI agent (Mac)
- **What was done:**
  1. Cloned VSprint repo to `/Users/anbschool0023/Documents/vsprint-late-night-project`
  2. Created `develop` branch for safe experimentation
  3. Generated 5 transparent robot mascot videos via Google Flow AI + rembg pipeline
  4. Replaced heavy Spline 3D viewer with lightweight video robots
  5. Redesigned hero: clean gradient, mouse-follow glow, parallax robot
  6. Added React Router with 3 pages (`/`, `/about`, `/app`)
  7. Context-aware navbar (shows different buttons per route)
  8. Created Firebase project `vsprint-app` + migrated auth from Supabase
  9. Rewrote LogIn/SignUp components to use Firebase Auth
  10. All committed on `develop` (5 granular commits)

- **What's NOT done:**
  - Firebase auth providers not enabled yet (needs console click)
  - Auth flow not tested end-to-end
  - AuthModal (smart gating) not built yet
  - Not pushed to GitHub yet
  - NOT merged to main

- **Next session:** Enable Firebase providers → test auth → build AuthModal → push to GitHub → get approval → merge to main.
- **Computer switch:** Can continue on any machine. Clone repo, checkout develop, create `.env` with GEMINI_API_KEY, run `npm install && npm run dev`.
