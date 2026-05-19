# 💅 Code Standards & Conventions

## General Principles
- **Surgical Edits:** When modifying code, use the minimal necessary change to preserve performance and avoid regressions.
- **Explicit Over Implicit:** Prefer clearly named variables and well-typed functions over clever abstractions.
- **Vibe Coding:** Maintain high-fidelity UI with consistent spacing, rounded corners, and smooth transitions.

## React & TypeScript
- **React 19:** Use functional components and standard hooks. Avoid legacy patterns.
- **Strict Typing:** Every function parameter, state, and API response must have a corresponding interface in `types.ts`.
- **Early Returns:** Use guard clauses to handle error/loading states early in component logic.

## CSS & Styling
- **Tailwind 4:** Use utility-first styling. Avoid custom CSS files unless implementing complex animations that Tailwind cannot handle.
- **Motion 12:** Use `motion.div` for entrance animations and state transitions. Ensure `AnimatePresence` is used for unmounting components.

## AI Response Schema
The `COACH_INSTRUCTIONS` in `App.tsx` define a strict JSON format. Never deviate from this:
```json
{
  "type": "project",
  "explanation": "...",
  "code": { "html": "...", "css": "...", "js": "..." },
  "learning": { "logic": [], "mistake": "...", "practiceTask": "...", "nextSteps": [] }
}
```

## Git & Workflow
- **Commit Messages:** Use conventional commits (feat:, fix:, chore:, docs:).
- **State Persistence:** Always ensure that new interactions are persisted to Supabase immediately after generation.
