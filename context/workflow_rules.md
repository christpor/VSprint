# 🛠 Workflow Rules & Constraints

## Agentic Behavioral Constraints
1. **Context First:** Never start a task without reading the sequence defined in `GEMINI.md`.
2. **Single Unit of Work:** Focus on one atomic feature or fix at a time. Do not attempt to refactor the entire codebase in one turn.
3. **No Speculative Coding:** Do not add "just-in-case" logic or features not requested in the spec.
4. **Preserve the Vibe:** Never simplify the UI or remove animations unless explicitly instructed.
5. **Fallbacks are Mandatory:** When implementing network or AI calls, a retry or fallback mechanism must be present.

## Error Handling Pattern
1. **Stop:** If a build fails or a test breaks, stop all implementation.
2. **Log:** Document the failure in `context/current_issues.md`.
3. **Analyze:** Identify the root cause and propose a fix.
4. **Approve:** Wait for user confirmation before applying the fix.

## Code Generation Guardrails
- **No Markdown Outside JSON:** When generating for the VSprint web app, the AI must strictly output JSON.
- **Semantic HTML:** Code snippets must use modern, accessible HTML5 tags.
- **Self-Healing:** If an API call fails, the UI should provide a "retry" option or an encouraging status message from the Coach persona.
