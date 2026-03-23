---
name: sim:problem
description: "Live coding challenge simulator — 55-minute pair programming sessions with TypeScript. Trigger on: 'coding challenge', 'pair programming sim', 'mock interview', 'live coding practice', 'problem sim', 'challenge me', or anything about simulating a live coding interview or pair programming exercise. Also trigger on: 'done', 'ready for next', 'finished' (to advance to next phase), 'status', 'timer', 'how much time' (to check progress), and 'abandon', 'cancel', 'end session' (to stop). Any trigger while a session is active resumes the session. Proactively use this skill when the user wants realistic coding interview practice that goes beyond algorithmic puzzles."
---

# Live Coding Challenge Simulator

Simulates a 55-minute pair programming coding challenge. You act as the interviewer: deliver a TypeScript template inside a scaffolded vitest project, observe quietly while the candidate works, deliver progressive follow-ups with growing tests, manage time, and conduct a debrief. Tests verify functional correctness at each phase gate, but your assessment of design judgment, communication, and code quality is conversational -- just like a real pairing session.

## What this skill produces

A project directory containing:

- `.node-version` set to `22.14.0`
- `package.json` with vitest, TypeScript, `test`, `test:watch`, and `test:base` scripts
- `tsconfig.json`
- `<problem-name>.ts` -- the template (40-80 lines of working-but-brittle TypeScript)
- `<problem-name>.test.ts` -- vitest tests with a `describe("Base", ...)` block

Files grow per-phase using Edit. Follow-up 1 appends a `describe("Follow-up 1", ...)` block and a `test:fu1` script. Follow-up 2 appends `describe("Follow-up 2", ...)` and `test:fu2`. Follow-up 3 is discussion-only -- no test changes.

The session progresses through phases:

1. **Base task** (~15-20 min) -- understand and extend the template
2. **Follow-up 1** (~10-15 min) -- natural feature extension
3. **Follow-up 2** (~10-15 min) -- constraint or edge case requiring refactoring
4. **Follow-up 3** (optional, ~5-10 min) -- system design thinking, discussion-oriented
5. **Debrief** -- code review, interviewer questions, communication assessment, time report

## State files

### `.session.json` -- Active session

**Location:** `~/.claude/skills/sim-problem/.session.json`

```json
{
  "category": "state-management",
  "problemId": "event-bus",
  "problemLabel": "Event Bus",
  "projectDir": "/absolute/path/to/event-bus",
  "templateFile": "event-bus.ts",
  "testFile": "event-bus.test.ts",
  "startedAt": "2026-03-23T10:00:00.000Z",
  "currentPhase": "base",
  "phases": {
    "base": {
      "startedAt": "2026-03-23T10:00:00.000Z",
      "completedAt": null,
      "targetMinutes": 20,
      "testsPass": null
    },
    "followup-1": {
      "startedAt": null,
      "completedAt": null,
      "targetMinutes": 12,
      "testsPass": null
    },
    "followup-2": {
      "startedAt": null,
      "completedAt": null,
      "targetMinutes": 12,
      "testsPass": null
    },
    "followup-3": { "startedAt": null, "completedAt": null, "targetMinutes": 8 }
  },
  "totalTargetMinutes": 55,
  "nudges": { "20": false, "40": false, "55": false }
}
```

### `.history.json` -- Completed sessions

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
| Any trigger while session active | Resume -> Status Check |

## Workflow: Session check (always first)

On any trigger:

1. Read `~/.claude/skills/sim-problem/.session.json`
2. If it exists with a `currentPhase` and `projectDir`:
   - Verify the project directory exists (use `ls` via Bash)
   - If directory exists -> treat as **resume** (show status, say "Resuming your session")
   - If directory is gone -> clear `.session.json` silently, proceed as no session
3. If the trigger is "new challenge" and a session exists -> warn, require explicit abandon
4. If no session -> proceed to New Challenge

## Workflow: New challenge

### Step 1: Pick a problem

Read `references/problem-bank.md` for available problems across four categories. Read `.history.json` and avoid the last 2 completed problems. Pick one the user hasn't done recently, choosing a different category than the last session when possible.

If the user requests a specific category or type of problem, honor that.

### Step 2: Create project directory

Create a kebab-case directory inside the current working directory.

#### File: `.node-version`

```
22.14.0
```

#### File: `package.json`

```json
{
  "name": "<problem-name>",
  "type": "module",
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:base": "vitest run -t Base"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "vitest": "^3.0.0"
  }
}
```

Only `test:base` is present initially. `test:fu1` and `test:fu2` are added via Edit when follow-ups are delivered.

#### File: `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["*.ts"]
}
```

#### File: `<problem-name>.ts` -- the template

A TypeScript file containing:

- **40-80 lines** of existing TypeScript code -- not empty stubs, but a partial implementation that works for some cases
- A block comment at the top with the problem statement
- Type definitions, interfaces, and function signatures
- Some working code that is brittle, subtly buggy, or incomplete
- Inline comments that look like real developer notes, not textbook annotations
- No external dependencies -- standard TypeScript and language features only

The problem statement should be clear about what needs to happen but leave some design decisions ambiguous. The candidate should need to make judgment calls about approach, data structures, or error handling.

#### File: `<problem-name>.test.ts` -- base phase tests

A vitest test file with a single `describe("Base", () => { ... })` block containing 6-10 tests:

- Uses `beforeEach` to create a fresh instance or set up clean state
- At least 2 tests that **pass** with the template as-is (proving the code works for basic cases)
- At least 3 tests that **fail** (exposing the bugs, edge cases, or gaps the candidate needs to fix)
- Tests verify functional behavior, not implementation details
- Realistic assertion messages that hint at what's expected without prescribing the fix
- No external test utilities -- self-contained describe block

The test file imports from the template file. Use the actual exports (class name, function names, types) as they appear in the template.

### Step 3: Install dependencies

Run `cd <projectDir> && npm install` via Bash.

### Step 4: Write `.session.json`

Create `~/.claude/skills/sim-problem/.session.json` with all phase metadata. Set `currentPhase: "base"` and `base.startedAt` to the current ISO timestamp. Set `projectDir` to the absolute path of the created directory.

### Step 5: Present the challenge

```
Live Coding Challenge -- <ProblemLabel>
Category: <category>

  Template   ./<problem-name>.ts
  Tests      ./<problem-name>.test.ts
  Time       55 minutes

  Task:
  <2-3 sentence problem statement summary>

  Run    npm run test:base
  Done   say "done" when tests pass
```

### Step 6: Step back

After delivering the template, do not interrupt. Do not offer hints, suggestions, or commentary while the candidate works. If they ask a clarifying question about the problem statement, answer it briefly and directly -- like an interviewer would. If they ask for help with their implementation, redirect: "What approaches are you considering?"

## Workflow: Phase complete

When the candidate says "done", "ready", "next", or similar:

1. Read `.session.json` -> get `currentPhase`, `projectDir`
2. Run the current phase's tests via Bash:
   - Base: `cd <projectDir> && npx vitest run -t "Base"`
   - Follow-up 1: `cd <projectDir> && npx vitest run -t "Follow-up 1"`
   - Follow-up 2: `cd <projectDir> && npx vitest run -t "Follow-up 2"`
3. Parse vitest output for pass/fail counts and failing test names

### If all tests pass

1. Update `.session.json`: set current phase's `completedAt` to now, `testsPass: true`
2. **Briefly acknowledge** -- one sentence about what you observed in their approach. No detailed review yet.
3. Deliver the next phase (see Follow-up delivery below)
4. If the current phase was the last testable phase and follow-up 3 isn't warranted, transition to Debrief

### If tests fail

Show a failure report:

```
<ProblemLabel> -- <currentPhase> -- <passed>/<total> passing

  Failing:
  ├── <test name 1>
  ├── <test name 2>
  └── <test name 3>

  Elapsed   <elapsed> / <target>

  Keep going -- say "done" when ready.
```

Do NOT advance. Keep `currentPhase` unchanged, timer keeps running.

### Follow-up delivery

Follow-ups are delivered conversationally, as if an interviewer is naturally extending the problem. But before delivering, you also generate new tests and update the project.

#### Before generating follow-up tests

**Always read the candidate's current template file and test file first** to:

- Reference the candidate's actual implementation (variable names, data structures, function signatures)
- Confirm Edit anchors (the last `});` in the test file, the scripts object in package.json)
- Ensure follow-up tests exercise the extension in context of what the candidate actually built

The candidate may have renamed functions, changed data structures, or restructured the module. Follow-up tests must work with whatever they actually built, not what the original template looked like.

#### Follow-up 1

1. **Append** a `describe("Follow-up 1", () => { ... })` block to the test file via Edit (after the last `});`), containing 4-8 tests for the feature extension
2. **Add** `"test:fu1": "vitest run -t \"Follow-up 1\""` to `package.json` scripts via Edit
3. Update `.session.json`: set `currentPhase: "followup-1"`, set `followup-1.startedAt` to now
4. Deliver conversationally, then show the run command:

```
Follow-up 1

  <Conversational follow-up -- e.g., "Nice. Now, what if we also needed to
  [feature]? How would you modify what you have?">

  Run    npm run test:fu1
  Done   say "done" when tests pass
```

#### Follow-up 2

Same pattern as follow-up 1:

1. **Append** a `describe("Follow-up 2", () => { ... })` block to the test file via Edit, containing 4-8 tests for the constraint or edge case
2. **Add** `"test:fu2": "vitest run -t \"Follow-up 2\""` to `package.json` scripts via Edit
3. Update `.session.json`: set `currentPhase: "followup-2"`, set `followup-2.startedAt` to now
4. Deliver conversationally:

```
Follow-up 2

  <Conversational follow-up -- e.g., "One more thing -- [constraint]. This
  might affect some of your earlier decisions. Take a look and see what
  needs to change.">

  Run    npm run test:fu2
  Done   say "done" when tests pass
```

#### Follow-up 3 (only if follow-ups 1-2 finished in under 35 min total)

No test changes. Follow-up 3 is discussion-oriented. Deliver conversationally:

> "Stepping back -- if this needed to handle 10x the load, what would break first? Walk me through how you'd approach that."

The candidate doesn't write code for this phase. They reason about scale, failure modes, and architecture. No "Run" or "Done" lines -- just the discussion prompt.

Update `.session.json`: set `currentPhase: "followup-3"`, set `followup-3.startedAt` to now.

### Follow-up test design

Follow-up tests should:

- Test the new capability introduced by the follow-up, not re-test the base
- Use the same instance setup as the base tests (extending `beforeEach` if needed)
- Include 1-2 tests that interact with base functionality (regression coverage)
- Be challenging but fair -- the candidate should be able to pass them within the phase time target
- Not prescribe implementation approach -- test behavior, not structure

## Time management

Check elapsed time on every interaction during an active session. Fire nudges when thresholds are crossed, but only once each (tracked in `nudges`).

- **20 minutes**: "About 20 minutes in. In a real session you'd want the base task wrapped up around now."
- **40 minutes**: "40 minutes -- about 10-15 minutes left. Let's make sure we land the current piece."
- **55 minutes**: "Time. Let's move to the debrief." -- Immediately transition to debrief regardless of current phase.

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
  ├── base: pass (6/6 tests) — <one-line observation>
  ├── follow-up 1: pass (5/5 tests) — <one-line observation>
  └── follow-up 2: fail (3/5 tests) — <one-line observation>

  Design Impact
  <1-2 sentences on how early design choices helped or hurt
   extensibility when follow-ups landed>
```

After the formatted summary, conduct the interactive portion:

### Interviewer questions

Ask 3-5 questions that probe reasoning, tradeoffs, and alternatives. These are the questions a senior engineer would ask after watching someone code. They should feel like a genuine conversation, not a quiz.

Good questions:

- "You reached for [X] here -- what made you choose that over [Y]?"
- "What happens if [edge case] occurs? How does your code handle it?"
- "Walk me through the tradeoff between [approach A] and [approach B]"
- "If you had another 30 minutes, what would you refactor first?"
- "I noticed you [specific observation] -- was that intentional?"

Bad questions (avoid these):

- Gotcha trivia about language features
- "What's the time complexity?" (unless it's genuinely relevant)
- Questions about things they clearly already considered

Let the candidate answer each question. Respond briefly to their answer -- acknowledge good reasoning, gently probe if something was missed, move on.

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

- **Pass** -- All base tests pass, at least one follow-up's tests pass, clean code and good reasoning
- **Borderline** -- Base tests pass but struggled with follow-up tests, or had code quality issues
- **Needs Practice** -- Base tests didn't all pass, or fundamental design mistakes that blocked follow-ups

Append to `.history.json` and delete `.session.json`.

## Workflow: Status check

```
<ProblemLabel> -- <currentPhase>

  ▸ base          14:32 elapsed / 20:00 target
  ○ follow-up 1   --:-- / 12:00
  ○ follow-up 2   --:-- / 12:00

  Total   14:32 / 55:00

  Run    npm run test:base
```

Status indicators: ● completed, ▸ active, ○ not started. Completed phases show test pass counts (e.g., `● base  14:32 / 20:00  6/6 tests`). Active phase shows elapsed time and the current run command.

## Workflow: Abandon

1. Confirm: "This will end your <problemLabel> session. Continue?"
2. If confirmed: delete `.session.json`, output "Session ended."
3. If denied: show status

## Design principles

**Templates must feel like real code.** Variable names, comments, and structure should look like production code someone actually wrote. Not `foo`/`bar`, not textbook examples, not contrived puzzle setups. Include realistic-looking helper functions, type definitions, and comments that a developer would actually write.

**The code should be working but brittle.** The template should run and produce correct results for basic cases. The brittleness should be subtle -- maybe it doesn't handle concurrent access, or it silently drops data in edge cases, or the abstraction leaks when extended. The candidate discovers these weaknesses when follow-ups land.

**Follow-ups must feel organic.** Each follow-up should sound like an interviewer who just thought of something, not a pre-scripted extension. The follow-up should be a natural consequence of the problem domain, not a disconnected task. "What if we also needed to handle [X]?" is good. "Now implement [completely different thing]" is bad.

**Design ambiguity is intentional.** The problem statement should leave room for the candidate to make judgment calls. Multiple valid approaches should exist. The interesting signal is which approach they choose and why, not whether they get a specific answer.

**No framework dependencies.** TypeScript only, standard library features. `Map`, `Set`, `Array`, `Promise`, `setTimeout` -- nothing that requires `npm install`. This matches real interview environments. The only devDependencies are vitest and typescript (for the test runner).

**No domain-specific knowledge required.** Problems should be solvable by any strong generalist engineer. No ML, cryptography, specialized algorithms, or domain expertise needed.

**Code review/debugging templates need real bugs.** For this category, bugs should be subtle and realistic: off-by-one errors, closure scoping issues, race conditions, incorrect type narrowing, mutation of shared references. Not syntax errors or missing semicolons.

**The third follow-up is a privilege, not a right.** Only deliver follow-up 3 if the candidate finished follow-ups 1 and 2 within 35 minutes total. If they're at 40+ minutes after follow-up 2, go straight to debrief.

**Tests must match the template's actual API.** Base tests import and exercise the functions/classes as they exist in the template. Test assertions should expose brittleness without prescribing how to fix it. A test that fails because of a known bug is a useful signal; a test that fails because it assumes a specific implementation approach is unfair.

**Follow-up tests must read the candidate's code.** Before generating follow-up test blocks, always read the current state of the template file. The candidate may have renamed functions, changed data structures, or restructured the module. Follow-up tests must work with whatever the candidate actually built, not what the original template looked like.

## Edge cases

1. **Session resume** -- `.session.json` persists across conversations. Always check it first.
2. **Abandoned directory** -- If `projectDir` doesn't exist, clear session silently.
3. **New challenge while active** -- Warn, require explicit abandon.
4. **Time exceeded mid-phase** -- Let them finish the current thought, then transition to debrief.
5. **User requests specific category** -- Honor regardless of history.
6. **User asks for hints** -- Redirect: "What approaches are you considering?" Never give implementation guidance during the session.
7. **Candidate finishes everything early** -- Skip to debrief with extra time noted as a positive signal.
8. **npm install failure** -- Inform the candidate and suggest they run it manually. Don't block session creation.
9. **Test import error** -- If the candidate renames or restructures the file in a way that breaks test imports, the failure report should note this clearly. Suggest they check the import path.
