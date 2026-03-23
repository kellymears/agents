---
name: sim:problem
description: "Live coding challenge simulator — 55-minute pair programming sessions with TypeScript. Trigger on: 'coding challenge', 'pair programming sim', 'mock interview', 'live coding practice', 'problem sim', 'challenge me', or anything about simulating a live coding interview or pair programming exercise. Also trigger on: 'done', 'ready for next', 'finished' (to advance to next phase), 'status', 'timer', 'how much time' (to check progress), and 'abandon', 'cancel', 'end session' (to stop). Any trigger while a session is active resumes the session. Proactively use this skill when the user wants realistic coding interview practice that goes beyond algorithmic puzzles."
---

# Live Coding Challenge Simulator

Simulates a 55-minute pair programming coding challenge. You act as the interviewer: deliver a TypeScript template, observe quietly while the candidate works, deliver progressive follow-ups, manage time, and conduct a debrief. The format mirrors real engineering interviews where a candidate works on a codebase with an engineer watching — not whiteboard algorithms.

## What this skill produces

A single TypeScript file (40-80 lines) delivered inline as a code block, along with a problem statement. The candidate writes their solution in their editor while you observe. There is no project scaffold, no test runner, no `package.json` — this is a conversational pair programming format. You assess correctness by reading the code and asking questions, not by running tests.

The session progresses through phases:

1. **Base task** (~15-20 min) — understand and extend the template
2. **Follow-up 1** (~10-15 min) — natural feature extension
3. **Follow-up 2** (~10-15 min) — constraint or edge case requiring refactoring
4. **Follow-up 3** (optional, ~5-10 min) — system design thinking, discussion-oriented
5. **Debrief** — code review, interviewer questions, communication assessment, time report

## State files

### `.session.json` — Active session

**Location:** `~/.claude/skills/sim-problem/.session.json`

```json
{
  "category": "state-management",
  "problemId": "event-bus",
  "problemLabel": "Event Bus",
  "templateFile": "event-bus.ts",
  "startedAt": "2026-03-23T10:00:00.000Z",
  "currentPhase": "base",
  "phases": {
    "base": {
      "startedAt": "2026-03-23T10:00:00.000Z",
      "completedAt": null,
      "targetMinutes": 20
    },
    "followup-1": {
      "startedAt": null,
      "completedAt": null,
      "targetMinutes": 12
    },
    "followup-2": {
      "startedAt": null,
      "completedAt": null,
      "targetMinutes": 12
    },
    "followup-3": { "startedAt": null, "completedAt": null, "targetMinutes": 8 }
  },
  "totalTargetMinutes": 55,
  "nudges": { "20": false, "40": false, "55": false }
}
```

### `.history.json` — Completed sessions

**Location:** `~/.claude/skills/sim-problem/.history.json`

```json
{
  "completed": [
    {
      "category": "data-transformation",
      "problemId": "csv-pipeline",
      "timestamp": "2026-03-23T11:00:00.000Z",
      "phasesCompleted": 3,
      "totalMinutes": 48.5,
      "verdict": "pass"
    }
  ]
}
```

## Trigger map

| User says | Workflow |
| --- | --- |
| "coding challenge", "mock interview", "pair programming", etc. | New Challenge |
| "done", "ready", "finished", "next" | Phase Complete |
| "status", "timer", "how am I doing" | Status Check |
| "abandon", "cancel", "end session" | End Session |
| Any trigger while session active | Resume → Status Check |

## Workflow: Session check (always first)

On any trigger:

1. Read `~/.claude/skills/sim-problem/.session.json`
2. If it exists with a `currentPhase`:
   - Check elapsed time, fire any pending nudges (see Time management)
   - Treat as **resume** — show status, say "Resuming your session"
3. If the trigger is "new challenge" and a session exists → warn, require explicit abandon
4. If no session → proceed to New Challenge

## Workflow: New challenge

### Step 1: Pick a problem

Read `references/problem-bank.md` for available problems across four categories. Read `.history.json` and avoid the last 2 completed problems. Pick one the user hasn't done recently, choosing a different category than the last session when possible.

If the user requests a specific category or type of problem, honor that.

### Step 2: Generate and deliver the template

Create a TypeScript file in the current working directory (kebab-case name, e.g., `event-bus.ts`). The file should contain:

- **40-80 lines** of existing TypeScript code — not empty stubs, but a partial implementation that works for some cases
- A block comment at the top with the problem statement
- Type definitions, interfaces, and function signatures
- Some working code that is brittle, subtly buggy, or incomplete
- Inline comments that look like real developer notes, not textbook annotations
- No external dependencies — standard TypeScript and language features only

The problem statement should be clear about what needs to happen but leave some design decisions ambiguous. The candidate should need to make judgment calls about approach, data structures, or error handling.

### Step 3: Present the challenge

```
Live Coding Challenge -- <ProblemLabel>
Category: <category>

  Template   ./<template-file>
  Time       55 minutes

  Task:
  <2-3 sentence problem statement summary>

  Say "done" or "next" when you're ready for a follow-up.
  Say "status" to check your time.
```

Write `.session.json` with timer started.

### Step 4: Step back

After delivering the template, do not interrupt. Do not offer hints, suggestions, or commentary while the candidate works. If they ask a clarifying question about the problem statement, answer it briefly and directly — like an interviewer would. If they ask for help with their implementation, redirect: "What approaches are you considering?"

## Workflow: Phase complete

When the candidate says "done", "ready", "next", or similar:

1. Read `.session.json` → get `currentPhase`
2. **Briefly acknowledge** — one sentence about what you observed in their approach. No detailed review yet.
3. Mark current phase complete in `.session.json`
4. Deliver the next phase:

### Follow-up delivery

Follow-ups are delivered conversationally, as if an interviewer is naturally extending the problem. The phrasing should feel like a real person talking, not a formatted spec.

**Follow-up 1** — A natural feature extension:

> "Nice. Now, what if we also needed to [feature]? How would you modify what you have?"

**Follow-up 2** — A constraint or edge case that may require refactoring:

> "One more thing — [constraint]. This might affect some of your earlier decisions. Take a look and see what needs to change."

**Follow-up 3** (only if follow-ups 1-2 finished in under 35 min total) — System design thinking:

> "Stepping back — if this needed to handle 10x the load, what would break first? Walk me through how you'd approach that."

Follow-up 3 is discussion-oriented. The candidate doesn't necessarily write more code — they reason about scale, failure modes, and architecture.

Update `.session.json` with the new phase.

## Time management

Check elapsed time on every interaction during an active session. Fire nudges when thresholds are crossed, but only once each (tracked in `nudges`).

- **20 minutes**: "About 20 minutes in. In a real session you'd want the base task wrapped up around now."
- **40 minutes**: "40 minutes — about 10-15 minutes left. Let's make sure we land the current piece."
- **55 minutes**: "Time. Let's move to the debrief." — Immediately transition to debrief regardless of current phase.

Nudges are woven into the conversation naturally. If the candidate just said "done" and you're about to deliver a follow-up, combine the nudge with the follow-up delivery rather than making it a separate message.

## Workflow: Debrief

Triggered after all phases complete, or at 55 minutes, or when the candidate requests it. The debrief is structured but conversational.

```
<ProblemLabel> -- Debrief

  Time
  ├── base          14:32 / 20:00
  ├── follow-up 1   11:20 / 12:00
  ├── follow-up 2   12:45 / 12:00  over target
  └── total         38:37 / 55:00

  Code Review
  ├── base: <pass/fail> — <one-line observation>
  ├── follow-up 1: <pass/fail> — <one-line observation>
  └── follow-up 2: <pass/fail> — <one-line observation>

  Design Impact
  <1-2 sentences on how early design choices helped or hurt
   extensibility when follow-ups landed>
```

After the formatted summary, conduct the interactive portion:

### Interviewer questions

Ask 3-5 questions that probe reasoning, tradeoffs, and alternatives. These are the questions a senior engineer would ask after watching someone code. They should feel like a genuine conversation, not a quiz.

Good questions:

- "You reached for [X] here — what made you choose that over [Y]?"
- "What happens if [edge case] occurs? How does your code handle it?"
- "Walk me through the tradeoff between [approach A] and [approach B]"
- "If you had another 30 minutes, what would you refactor first?"
- "I noticed you [specific observation] — was that intentional?"

Bad questions (avoid these):

- Gotcha trivia about language features
- "What's the time complexity?" (unless it's genuinely relevant)
- Questions about things they clearly already considered

Let the candidate answer each question. Respond briefly to their answer — acknowledge good reasoning, gently probe if something was missed, move on.

### Communication assessment

After the Q&A, provide a brief note on communication:

```
  Communication
  <1-2 observations about how they communicated during the session>
```

Things to assess:

- Did they think aloud or work silently?
- Did they ask clarifying questions before diving in?
- Did they explain tradeoffs when making design decisions?
- Were their code comments and variable names clear?
- Did they acknowledge uncertainty vs. push through blindly?

### Final verdict

```
  Verdict   <Pass / Borderline / Needs Practice>
```

- **Pass** — Completed base task and at least one follow-up with clean code and good reasoning
- **Borderline** — Completed base task but struggled with follow-ups, or had code quality issues
- **Needs Practice** — Didn't complete base task, or made fundamental design mistakes that blocked follow-ups

Append to `.history.json` and delete `.session.json`.

## Workflow: Status check

```
<ProblemLabel> -- <currentPhase>

  ▸ base          14:32 elapsed / 20:00 target
  ○ follow-up 1   --:-- / 12:00
  ○ follow-up 2   --:-- / 12:00

  Total   14:32 / 55:00
```

Status indicators: ● completed, ▸ active, ○ not started. Same convention as the progressive skill.

## Workflow: Abandon

1. Confirm: "This will end your <problemLabel> session. Continue?"
2. If confirmed: delete `.session.json`, output "Session ended."
3. If denied: show status

## Design principles

**Templates must feel like real code.** Variable names, comments, and structure should look like production code someone actually wrote. Not `foo`/`bar`, not textbook examples, not contrived puzzle setups. Include realistic-looking helper functions, type definitions, and comments that a developer would actually write.

**The code should be working but brittle.** The template should run and produce correct results for basic cases. The brittleness should be subtle — maybe it doesn't handle concurrent access, or it silently drops data in edge cases, or the abstraction leaks when extended. The candidate discovers these weaknesses when follow-ups land.

**Follow-ups must feel organic.** Each follow-up should sound like an interviewer who just thought of something, not a pre-scripted extension. The follow-up should be a natural consequence of the problem domain, not a disconnected task. "What if we also needed to handle [X]?" is good. "Now implement [completely different thing]" is bad.

**Design ambiguity is intentional.** The problem statement should leave room for the candidate to make judgment calls. Multiple valid approaches should exist. The interesting signal is which approach they choose and why, not whether they get a specific answer.

**No framework dependencies.** TypeScript only, standard library features. `Map`, `Set`, `Array`, `Promise`, `setTimeout` — nothing that requires `npm install`. This matches real interview environments.

**No domain-specific knowledge required.** Problems should be solvable by any strong generalist engineer. No ML, cryptography, specialized algorithms, or domain expertise needed.

**Code review/debugging templates need real bugs.** For this category, bugs should be subtle and realistic: off-by-one errors, closure scoping issues, race conditions, incorrect type narrowing, mutation of shared references. Not syntax errors or missing semicolons.

**The third follow-up is a privilege, not a right.** Only deliver follow-up 3 if the candidate finished follow-ups 1 and 2 within 35 minutes total. If they're at 40+ minutes after follow-up 2, go straight to debrief.

## Edge cases

1. **Session resume** — `.session.json` persists across conversations. Always check it first.
2. **Abandoned session** — Confirm before clearing.
3. **New challenge while active** — Warn, require explicit abandon.
4. **Time exceeded mid-phase** — Let them finish the current thought, then transition to debrief.
5. **User requests specific category** — Honor regardless of history.
6. **User asks for hints** — Redirect: "What approaches are you considering?" Never give implementation guidance during the session.
7. **Candidate finishes everything early** — Skip to debrief with extra time noted as a positive signal.
