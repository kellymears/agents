---
description: Red-green-refactor TDD cycle. Write a failing test, make it pass, clean up.
tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - AskUserQuestion
---

# Test-Driven Development

You are enforcing the red-green-refactor discipline. No production code exists without a failing test first. If code was written before its test, delete it and start over.

## The Cycle

Each cycle targets one behavior. Keep cycles small — minutes, not hours.

### RED — Write a failing test

1. Write one minimal test for the next behavior
2. Test one thing. Name it clearly. Avoid mocks unless at a system boundary.
3. Run the test suite
4. **Verify the failure reason.** The new test must fail because the feature is missing — not because of a syntax error, typo, or misconfigured import. If it fails for the wrong reason, fix the test. If it passes immediately, the behavior already exists or the test is wrong — investigate before continuing.

### GREEN — Make it pass

1. Write the simplest code that makes the failing test pass
2. No additional features. No refactoring. No "while I'm here" changes.
3. Run the test suite
4. **Verify all tests pass.** The new test passes AND every existing test still passes. If other tests broke, the implementation has unintended side effects — fix before continuing.

### REFACTOR — Clean up

1. Only enter this phase after GREEN is confirmed
2. Remove duplication, improve names, extract helpers, simplify conditionals
3. Run the test suite after each refactoring step
4. **Verify all tests still pass.** If anything broke, undo the refactor immediately.

### REPEAT

Return to RED for the next behavior.

## Red Flags

Stop the cycle and reassess if any of these occur:

- Production code was written before its test
- A new test passes immediately without new production code
- You cannot explain why a test failed
- Multiple behaviors are being tested in one cycle
- Refactoring is happening during RED or GREEN phase
- A GREEN change breaks existing tests

When a red flag appears, state what went wrong, undo to the last green state, and restart the cycle.

## Running a Session

Before starting, ask the user:

1. What behavior are we building (or what bug are we fixing)?
2. What test framework and runner does this project use? (or discover it)

Then begin the first RED phase.

At the end of each complete cycle (after REFACTOR), report:
- What behavior was added
- How many tests pass
- What the next RED cycle should target

Ask the user to confirm before starting the next cycle.

## Bug Fix Protocol

For bug fixes, the first RED phase reproduces the bug:

1. Write a test that demonstrates the broken behavior (it should fail because the bug exists and the test expects correct behavior — or pass if the test captures the buggy behavior as a regression)
2. Confirm the test fails for the right reason
3. Proceed to GREEN — fix the bug with the minimal change
4. REFACTOR if needed

## When NOT to Use TDD

Ask the user before skipping the cycle for:

- Throwaway prototypes or spikes
- Generated/scaffolded code
- Configuration-only changes (no logic to test)
- Exploratory work where requirements are unknown

Even in these cases, consider writing tests after the fact.

## Language Agnosticism

This command enforces the discipline. It does not prescribe test frameworks, assertion styles, or file conventions. Defer to the project's existing test infrastructure and patterns. If a tester agent is handling framework specifics, stay out of its way on those decisions — focus on the cycle.
