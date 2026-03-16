---
name: progressive-sim
description: "Interactive test proctor for progressive coding assessments. Trigger on: 'new sim', 'generate a problem', 'practice problem', 'another simulation', or anything about creating timed coding exercises. Also trigger on: 'done', 'finished', 'next level', 'tests pass', 'I'm done' (to verify and advance), 'status', 'timer', 'how am I doing', 'where am I' (to check progress), and 'abandon', 'cancel sim', 'start over' (to end session). Any trigger while a session is active resumes the session. Generates progressive L1-L4 TypeScript projects incrementally, one level at a time, with vitest tests."
---

# Progressive Coding Assessment Simulator

Interactive test proctor for progressive coding assessments modeled on the CodeSignal Industry Coding Assessment (ICA) format. Generates levels one at a time, tracks time, verifies test results, and advances automatically. See `references/problem-bank.md` for domain provenance and source links.

## What this skill produces

A progressively-built project with:

- `package.json` with vitest (test scripts added per-level)
- `tsconfig.json`
- `.node-version` set to `22.14.0` (matches CodeSignal's Node environment)
- An interface file with abstract methods (grows per level)
- A scaffolded implementation file with `throw new Error("Not implemented")` stubs (grows per level)
- A vitest test file with describe blocks (grows per level)

Files start with **only L1 content**. Each subsequent level is appended via Edit when the user completes the current level.

## State files

### `.session.json` — Active proctor state

**Location:** `~/.claude/skills/progressive-sim/.session.json`

Tracks the active session. Created on `new sim`, cleared on final completion or `abandon`.

```json
{
  "domain": "in-memory-database",
  "domainLabel": "In-Memory Database",
  "projectDir": "/Users/kellymears/code/anthro/in-memory-database",
  "maxLevel": 4,
  "currentLevel": 1,
  "startedAt": "2026-03-07T14:30:00.000Z",
  "levels": {
    "1": {
      "startedAt": "2026-03-07T14:30:00.000Z",
      "completedAt": null,
      "methods": ["set", "get", "delete", "keys"],
      "targetMinutes": 15
    },
    "2": {
      "startedAt": null,
      "completedAt": null,
      "methods": ["scan", "scanByValuePrefix", "count", "getRange"],
      "targetMinutes": 20
    },
    "3": {
      "startedAt": null,
      "completedAt": null,
      "methods": ["setAt", "setAtWithTTL", "getAt", "scanAt", "deleteAt"],
      "targetMinutes": 25
    },
    "4": {
      "startedAt": null,
      "completedAt": null,
      "methods": ["backup", "restore", "listBackups", "compact"],
      "targetMinutes": 25
    }
  }
}
```

All levels are pre-populated at session start (methods come from the problem bank), but only the current level has content generated in the actual files.

### `.history.json` — Completed domain tracking

**Location:** `~/.claude/skills/progressive-sim/.history.json`

Tracks completed sessions to avoid repetition. Append after final completion.

```json
{
  "generated": [
    {
      "domain": "in-memory-database",
      "timestamp": "2026-03-07T16:00:00.000Z",
      "levels": "L1-L4",
      "totalMinutes": 78.88,
      "levelTimes": { "1": 12.25, "2": 17.38, "3": 28.17, "4": 21.08 }
    }
  ]
}
```

Backward-compatible — old entries without timing data still work for domain avoidance.

## Trigger map

| User says | Workflow |
| --- | --- |
| "new sim", "generate a problem", "practice problem", etc. | New Simulation |
| "done", "finished", "next", "tests pass", "I'm done" | Done / Verify |
| "status", "timer", "how am I doing", "where am I" | Status Check |
| "abandon", "cancel sim", "start over" | Clear `.session.json`, confirm |
| Any skill trigger while `.session.json` exists with active level | Session Resume -> Status Check |

## Workflow: Session check (always first)

On **any** trigger, before doing anything else:

1. Read `~/.claude/skills/progressive-sim/.session.json`
2. If it exists with a `currentLevel` and `projectDir`:
   - Verify the project directory exists (use `ls` via Bash)
   - If directory exists -> treat as **resume** (show status dashboard, say "Resuming your session")
   - If directory is gone -> clear `.session.json` silently, proceed as no session
3. If the trigger is "new sim" and an active session exists -> warn and ask the user to either `abandon` or continue
4. If no session exists -> proceed to New Simulation workflow

## Workflow: New simulation

### Step 1: Pick a domain

Read `references/problem-bank.md` (in this skill's directory) to see available domains and their level breakdowns. Read `.history.json` and avoid the most recent 3 domains. Pick one the user hasn't done recently, or invent a new one that follows the same structural pattern.

If the user requests a specific domain, honor that regardless of history. If they request specific levels (e.g., "just L1-L3"), set `maxLevel` accordingly.

### Step 2: Generate L1 only

Create the project directory (kebab-case) inside the current working directory.

#### File: `.node-version`

```
22.14.0
```

#### File: `package.json`

```json
{
  "name": "<domain-name>",
  "type": "module",
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:l1": "vitest run -t L1"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "vitest": "^3.0.0"
  }
}
```

Only the `test:l1` script is included. Additional level scripts are added via Edit when levels are unlocked.

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

#### File: `<DomainName>Interface.ts`

Abstract class with **L1 methods only**:

- Header comment identifying this as a progressive assessment
- Types/interfaces needed for L1
- Abstract method declarations with full JSDoc (what it does, returns, edge cases)
- Level section comment: `// --- L1: <description> ---`

Do NOT include L2-L4 methods. They will be appended when those levels are unlocked.

#### File: `<DomainName>.ts`

Implementation scaffold with **L1 stubs only**:

- Extends the interface
- Constructor includes `private now: () => number = Date.now` for injectable clock (used later by L3/L4)
- L1 methods stub with `throw new Error("Not implemented")`
- Level section comment matching the interface

#### File: `<DomainName>.test.ts`

Vitest tests with **L1 describe block only**:

- `describe("L1", () => { ... })`
- 8-15 tests covering happy path, edge cases, empty state, nonexistent ids, duplicates, sorted output
- Uses `beforeEach` to set up fresh instances
- L1-L2 tests do NOT need the injectable clock in `beforeEach`

### Step 3: Install dependencies

Run `cd <projectDir> && npm install` via Bash.

### Step 4: Write `.session.json`

Create `~/.claude/skills/progressive-sim/.session.json` with all level metadata pre-populated. Set `currentLevel: 1` and level 1's `startedAt` to the current ISO timestamp.

### Step 5: Present Level 1 Dashboard

Show the Level Dashboard (see Terminal display formats below).

## Workflow: Present level (dashboard)

Output clean, tree-structured text. No boxes. Minimal and readable — feel like Claude Code's own terminal output.

```
<DomainLabel> -- Level <N> of <maxLevel>

  Started   <time>
  Target    <targetMinutes> minutes

  Implement:
  ├── method1(args)
  ├── method2(args)
  ├── method3(args)
  └── method4(args)

  Run    npm run test:l<N>
  Done   say "done" when tests pass
```

## Workflow: Done / verify

1. Read `.session.json` -> get `currentLevel` (N), `projectDir`
2. Run `cd <projectDir> && npx vitest run -t "L<N>"` via Bash
3. Parse vitest output for pass/fail counts and failing test names

### If all tests pass:

1. Update `.session.json`: set level N's `completedAt` to now
2. Show **completion report** (see Terminal display formats)
3. If N < maxLevel:
   - **Append next level content** to existing files using Edit (see Incremental file generation)
   - Add `test:l<N+1>` script to `package.json` via Edit
   - Update `.session.json`: set `currentLevel` to N+1, set level N+1's `startedAt` to now
   - Present next Level Dashboard
4. If N === maxLevel:
   - Show **Final Completion Summary** (see Terminal display formats)
   - Append to `.history.json` with timing data
   - Delete `.session.json`

### If tests fail:

1. Show **failure report** with failing test names (see Terminal display formats)
2. Do NOT advance — keep `currentLevel` at N, timer keeps running
3. Encourage user to keep working

## Workflow: Status check

1. Read `.session.json`
2. Calculate elapsed time for current level (now - level N startedAt)
3. Calculate total elapsed time (now - session startedAt)
4. Show the Status Dashboard (see Terminal display formats)

## Workflow: Abandon

1. Read `.session.json`
2. Confirm with user: "This will end your <domainLabel> session. Continue?"
3. If confirmed: delete `.session.json`, output "Session cleared."
4. If denied: show current status dashboard

## Incremental file generation

Files grow level-by-level using **Edit**, not Write. This is the core behavioral difference from the old skill.

### Before generating L2+ content

**Always read the existing interface, implementation, and test files first** to:

- Confirm Edit anchors (closing braces, last describe block) are correct
- Reference existing types and patterns in new content
- Ensure new methods reference the data model as it has evolved

### Appending a new level

**Interface file** — Insert new level's abstract methods before the final closing `}` of the abstract class:

```
old_string: the final "}" of the abstract class (with its surrounding context to be unique)
new_string: new level section comment + abstract method declarations + closing "}"
```

**Implementation file** — Insert new level's stubs before the final closing `}` of the class:

```
old_string: the final "}" of the class (with surrounding context to be unique)
new_string: new level section comment + stub methods + closing "}"
```

**Test file** — Append new describe block at the end of the file, after the last `});`. For L3+ test blocks, set up the injectable clock: `let clock = 0; instance = new Thing(() => clock);` in `beforeEach`.

**package.json** — Add the new `test:l<N>` script via Edit on the scripts object.

## Terminal display formats

Style: No boxes. Use tree-style branching for lists, status indicators for levels, and clean spacing. Minimal and readable.

Status indicator convention (plain text, no color emoji):

- Completed: ●
- Active / in progress: ▸
- Over target: ● with "over target" suffix
- Not started: ○

### Completion report (tests pass)

```
Level <N> complete -- <elapsed> / <target>

  Tests   <passed>/<total> passed

  ● L1   12:34 / 15:00
  ● L2   17:23 / 20:00
  ○ L3   --:-- / 25:00
  ○ L4   --:-- / 25:00

  Total   <totalElapsed> / <totalTarget>

  Loading Level <N+1>...
```

Completed levels show ●. Levels over target show ● with "over target" suffix. Not-started levels show ○.

### Failure report (tests fail)

```
Level <N> -- <passed>/<total> passing

  Failing:
  ├── <test name 1>
  ├── <test name 2>
  └── <test name 3>

  Elapsed   <elapsed> / <target>

  Keep going -- say "done" when ready.
```

### Final completion summary

```
<DomainLabel> -- Complete

  ● L1   12:15 / 15:00
  ● L2   17:23 / 20:00
  ● L3   28:10 / 25:00  over target
  ● L4   21:05 / 25:00

  Total    78:53 / 85:00  (+5:00 buffer = 90:00)
  Result   Pass -- within 90 minute window
```

All completed levels show ●. Levels over target append "over target" suffix.

### Status check (mid-level)

```
<DomainLabel> -- Level <N> of <maxLevel>

  ● L1   12:15 / 15:00
  ▸ L2   8:32 elapsed / 20:00 target
  ○ L3   --:-- / 25:00
  ○ L4   --:-- / 25:00

  Total   <totalElapsed> elapsed
```

Active level shows ▸. Completed levels show ●. Not-started levels show ○.

## Design principles

Follow these rules when designing problems:

**Progressive complexity must be structural, not just additive.**

- L1: Basic CRUD -- 3-4 core operations on a simple data model (add, get, remove, list).
- L2: Filtering & querying -- scan, prefix/suffix match, typed collection returns over L1's data.
- L3: Time-awareness -- timestamps on operations, TTL/expiration, time-parameterized variants of L1-L2 methods.
- L4: State management -- backup/restore, snapshots, compression, or derived state operations.

**Each level should require extending the data model, not rewriting it.** The candidate who uses `Map<string, string>` at L1 and switches to `Map<string, { value: string, tags: Set<string> }>` at L2 should not have to restructure their L1 code. The test suite enforces this -- L1 tests must still pass at L4.

**L4 should be the hardest but not tricky.** Difficulty comes from managing more state and more interactions, not from algorithmic puzzles or gotcha edge cases.

**Use idiomatic TypeScript return types.** Methods should return native types: `boolean` for success/failure, `string | null` for lookups that may miss, typed arrays or tuples for collection returns. Define small interfaces or type aliases (e.g., `type KeyValue = { key: string; value: string }`) for structured returns. Avoid returning formatted strings or stringified booleans -- the tests and interface should feel like real TypeScript code.

**L2 is about operations over L1's data, not new entity types.** L2 methods should scan, filter, or query L1's data in new ways. Avoid introducing entirely new entity types at L2.

**L3 adds time-parameterized variants, not new entities.** L3 should add time-parameterized _variants_ of existing L1-L2 methods (e.g., `set_at_with_ttl`, `get_at`, `scan_at`). Timestamps and TTL/expiration are the core L3 pattern.

**L4 is the state snapshot pattern.** L4 should test backup/restore/transform of the full data state. Avoid making L4 about analytics or computed aggregates.

**Include at least one sorted-output method per level.**

**Time-dependent behavior belongs in L3 or L4, not earlier.** Keep L1 and L2 time-independent. L1-L2 tests don't need the injectable clock in `beforeEach`. L3+ tests should set up `let clock = 0; instance = new Thing(() => clock);`.

**When generating L2+ content, read the existing interface and implementation files first** to ensure Edit anchors are correct and new content references existing types/patterns.

**Tests should catch common mistakes:**

- Using `break` instead of `continue` in loops
- Forgetting to sort output
- Reference vs copy bugs (mutating stored objects)
- Falsy value traps (0, empty string)
- Off-by-one in pagination or indexing
- Forgetting to clean up related data on delete

## Edge cases

1. **Session resume across conversations** -- `.session.json` is the persistence mechanism. Always check it on any trigger.
2. **Abandoned directory** -- If `projectDir` doesn't exist, clear session silently.
3. **New sim while active** -- Warn and require explicit "abandon" before starting fresh.
4. **Partial levels** -- "Give me L1-L3" sets `maxLevel: 3`. L3 completion triggers final summary.
5. **No hints** -- If user asks for help during a session, remind them it's a timed simulation. Offer to show current test failures or the interface spec, but give no implementation guidance.

## Important notes

- Always include the `.node-version` file. The CodeSignal platform runs Node 22.14.0.
- All test blocks should be self-contained -- no shared test utilities across levels.
- Never generate problems that require knowledge of specific algorithms (no DP, no graph algorithms, no tree rotations). The progressive format tests engineering judgment and extensible design, not algorithmic knowledge.
- Every problem should be solvable using only: Map, Set, Array, basic iteration, sorting, and simple arithmetic. No external libraries.
- Target times per level: L1 = 15 min, L2 = 20 min, L3 = 25 min, L4 = 25 min, +5 min buffer = 90 min total.
