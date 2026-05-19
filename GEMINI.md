# 🧠 VSprint Context Router & Agent Workflow

## 1. FILE TOPOLOGY AND PURPOSE
- **Execution Priority:** This file acts as the primary orchestrator. The AI agent MUST process this file at the initialization of *every* new session before executing any other operations.
- **Context Folder:** All atomic context files are located in the `context/` directory.

## 2. STRICT SEQUENTIAL ROUTING SYSTEM
**CRITICAL RULE:** The agent is expressly FORBIDDEN from modifying code until it has ingested the context. You MUST read the following modular documents in this exact order:

1. **`context/project_overview.md`**: Establish the end goal and core user flows.
2. **`context/architecture.md`**: Tech stack, layer boundaries, and invariants.
3. **`context/code_standards.md`**: Syntax rules and formatting.
4. **`context/workflow_rules.md`**: Behavioral constraints.
5. **`context/ui_context.md`**: Design tokens and component rules.
6. **`context/progress_tracker.md`**: The active state of the project.

## 3. MANDATORY STATE MANAGEMENT
**CRITICAL RULE:** `context/progress_tracker.md` is the sole mechanism for cross-session AI memory.
- **Initialization Read:** Parse the tracker to identify the exact phase and goal.
- **Execution Constraint:** Execute ONLY the scoped unit of work defined.
- **Completion Write:** Before terminating a session, you MUST write updates to the `progress_tracker.md` file. Move active tasks to completed and document architectural decisions.

## 4. THE SPEC-DRIVEN FEATURE LIFECYCLE
**CRITICAL RULE:** The agent is completely prohibited from writing code based on a vague chat request.
- **Pre-Flight Reading:** Before generating code, read the corresponding spec in `context/feature_specs/`.
- **Scope Gating:** Strictly confine code generation to the boundaries defined within the spec.
- **Verification:** Compare output directly against the spec's verification checklist.

## 5. STRICT ERROR ISOLATION (ANTI-LOOP)
- **Protocol:** If an error occurs, the agent MUST stop writing code immediately.
- **Analysis-First Mode:** Document the error in `context/current_issues.md`, map out the root cause, and present a structured fix plan.
- **Explicit Authorization:** WAIT for explicit user validation before editing code to resolve the issue.

## 6. VSPRINT CORE MISSION (Legacy Context)
- **Role:** "The VSprint Coach" – Senior Developer mentor persona.
- **AI Architecture:** Primary: `gemini-2.0-flash`. Secondary: `gemini-1.5-pro`.
- **Engineering:** React 19, Vite 6, Motion 12, Tailwind 4+. Backend: Supabase Auth/Postgres.
- **Navigation:** `/src/App.tsx` (Main loop), `/src/components` (Modular UI), `/src/services` (Integrations).
