# Problem Bank

Problems for the live coding challenge simulator. Each entry describes a base task and 2-3 follow-ups. When generating a challenge, pick one and flesh it out into a full TypeScript template (40-80 lines) with realistic code, comments, and type definitions.

Problems are grouped into four categories. Each problem has enough variability in template structure, data shapes, and follow-up paths that repeat runs feel distinct. When inventing new problems, follow the same pattern: working-but-brittle base → organic extension → constraint that exposes brittleness.

---

## 1. State Management

Templates contain working but naive implementations. Follow-ups add state transitions, error recovery, or subscription semantics that expose design limits.

### Event Bus

**Base:** A typed event bus with `subscribe(event, handler)`, `emit(event, payload)`, and `unsubscribe(id)`. The template has a working implementation using a `Map<string, handler[]>`, but handler removal iterates the full array and the typing is loose (`any` payloads). Task: fix the unsubscribe performance, add proper generics for event payloads, handle the case where `emit` is called with no subscribers.

**Follow-up 1:** Add wildcard subscriptions (`subscribe("*", handler)`) that receive all events, and an `emitAsync` variant that awaits all handlers sequentially.

**Follow-up 2:** One handler throwing shouldn't break other handlers. Add error isolation — handlers that throw are caught and reported but don't prevent remaining handlers from executing. Also add `once()` subscriptions that auto-unsubscribe after first delivery.

**Follow-up 3:** "If this event bus needed to work across multiple processes or services, what would change? Walk me through the failure modes."

### Undo/Redo Stack

**Base:** An undo/redo system for a simple document model (a list of text operations: insert, delete, replace). The template has a working `execute(command)` / `undo()` / `redo()` but stores full document snapshots on every operation. Task: refactor to store deltas instead of snapshots, keeping the same public API.

**Follow-up 1:** Add grouped operations — `beginGroup()` / `endGroup()` that batch multiple commands into a single undo step.

**Follow-up 2:** After an undo, if the user executes a new command (divergent edit), the redo stack should be discarded. The template doesn't handle this correctly — it keeps stale redo entries. Fix it, and add a `branchHistory()` method that returns the discarded branch for potential recovery.

**Follow-up 3:** "What data structure changes would you make if this needed to support collaborative editing with multiple cursors?"

### Reactive Store

**Base:** A reactive key-value store with `get(key)`, `set(key, value)`, and `subscribe(key, callback)`. The template works but notifies subscribers even when the value hasn't actually changed (same value set twice), and has a bug where unsubscribing during a notification callback corrupts the subscriber list. Task: add equality checking and fix the concurrent-modification bug.

**Follow-up 1:** Add computed/derived values — `computed(key, deps, fn)` that auto-recalculates when any dependency changes. Computed values should be lazy (only recalculate on read if dirty).

**Follow-up 2:** Add transactions — `transaction(fn)` that batches multiple `set()` calls and notifies subscribers only once, after the transaction commits. If the function throws, roll back all changes.

**Follow-up 3:** "How would you handle circular dependencies in computed values? What's the right behavior?"

---

## 2. Data Transformation

Templates contain parsers or transformers with edge case gaps. Follow-ups add new input formats, streaming, or error recovery.

### CSV Pipeline

**Base:** A CSV parser that handles headers, quoted fields, and returns an array of objects. The template works for simple cases but breaks on: fields containing commas inside quotes, escaped quotes (`""`), and trailing newlines. Task: fix the edge cases to handle RFC 4180 compliant CSV.

**Follow-up 1:** Add column type coercion — the parser accepts a schema `{ column: 'string' | 'number' | 'boolean' | 'date' }` and coerces values, collecting validation errors per row instead of throwing.

**Follow-up 2:** Add streaming — instead of returning the full array, accept a `processRow(row)` callback and process the input line-by-line. Support backpressure: if the callback returns a `Promise`, wait for it before processing the next row.

**Follow-up 3:** "If you needed to parse a 10GB CSV file, what changes to the architecture? What about malformed rows in the middle?"

### JSON Path Resolver

**Base:** A function `resolve(obj, path)` that supports dot notation and array indexing (`a.b[0].c`). The template handles simple paths but fails on: nested array indexing (`a[0][1]`), paths with numeric object keys (`a.0.b`), and returns `undefined` instead of distinguishing "key exists with undefined value" from "key doesn't exist." Task: fix the edge cases and add proper null-vs-missing distinction.

**Follow-up 1:** Add wildcard selectors — `a[*].name` returns an array of all `name` values from array elements. `a.*.name` does the same for object properties.

**Follow-up 2:** Add filter expressions — `a[?(@.price > 10)]` returns array elements where the predicate holds. Support `>`, `<`, `==`, `!=`, and string `contains`.

**Follow-up 3:** "How would you handle circular references in the input object? What about paths that match thousands of nodes?"

### Schema Validator

**Base:** A `validate(data, schema)` function where schema is a simple type descriptor (`{ type: 'string' }`, `{ type: 'object', properties: { ... } }`, `{ type: 'array', items: ... }`). The template validates top-level types but doesn't recurse into nested objects/arrays, and returns a single boolean instead of error details. Task: add recursive validation and return structured error paths (e.g., `"address.zip: expected string, got number"`).

**Follow-up 1:** Add optional fields, enums (`{ type: 'enum', values: [...] }`), and union types (`{ oneOf: [schema1, schema2] }`). Error messages should indicate which union branch failed and why.

**Follow-up 2:** Add `minLength`, `maxLength` for strings, `minimum`, `maximum` for numbers, `minItems`, `maxItems` for arrays. Also add a `required` field list on object schemas — missing required fields should produce clear errors distinct from type errors.

**Follow-up 3:** "If schemas could reference other schemas by name (like JSON Schema's `$ref`), how would you handle circular schema references?"

---

## 3. Networked/Async Systems

Templates contain synchronous or simplistic async implementations. Follow-ups introduce concurrency, retry logic, backpressure, or distributed concerns.

### Retry with Backoff

**Base:** An `withRetry(fn, options)` wrapper that retries a failed async function with exponential backoff. The template has a working retry loop but: doesn't cap the backoff, doesn't distinguish retriable from non-retriable errors, and the delay calculation has an off-by-one (first retry waits 0ms). Task: fix the bugs, add max backoff, add an `isRetriable(error)` predicate option.

**Follow-up 1:** Add a circuit breaker — after N consecutive failures across any call, all subsequent calls fail immediately for a cooldown period. The circuit should half-open after cooldown (allow one test request).

**Follow-up 2:** Add request deduplication — if `withRetry` is called with the same arguments while a previous call is still in flight, return the same promise instead of making a duplicate request. Deduplication should be keyed by a configurable `cacheKey(args)` function.

**Follow-up 3:** "In a distributed system with multiple instances running this code, how would you coordinate the circuit breaker state?"

### Rate Limiter

**Base:** A token bucket rate limiter with `acquire()` that returns a promise resolving when a token is available. The template refills tokens at a fixed rate but has a bug: if multiple callers await simultaneously, they can all consume the same token (race condition on the token count). Task: fix the race condition and ensure fair ordering (FIFO).

**Follow-up 1:** Add per-key rate limiting — `acquire(key)` with different limits per key. Keys not explicitly configured use a default limit. Add `getStats(key)` returning available tokens and queue depth.

**Follow-up 2:** Switch from fixed token bucket to sliding window. Add burst allowance — allow short bursts up to 2x the normal rate as long as the sliding window average stays within limits.

**Follow-up 3:** "How would you implement rate limiting across multiple server instances sharing a Redis backend?"

### Task Queue

**Base:** A promise queue with configurable concurrency limit. `enqueue(fn)` returns a promise that resolves with the function's result. The template runs tasks concurrently but doesn't respect the limit properly — it checks the count before starting but doesn't account for tasks that resolve synchronously. Task: fix the concurrency accounting and add proper drain notification.

**Follow-up 1:** Add priority levels (1-5, lower is higher priority). Higher-priority tasks should jump ahead of lower-priority pending tasks. Add `cancel(taskId)` that rejects the task's promise with a cancellation error.

**Follow-up 2:** Add per-task timeout — if a task doesn't resolve within its timeout, reject its promise and free the concurrency slot. Add a queue-level `pause()` / `resume()` that stops dequeuing new tasks but lets in-flight tasks finish.

**Follow-up 3:** "What happens if tasks have dependencies on each other? How would you prevent deadlocks?"

---

## 4. Code Review/Debugging

Templates contain 60-80 lines with 2-3 subtle bugs and at least one architectural smell. The task is to identify issues, fix them, then extend. Follow-ups expose whether the candidate addressed root causes or just patched symptoms.

### Buggy LRU Cache

**Base template (bugs to find):**
1. The `delete` method removes from the map but doesn't remove from the doubly-linked list (memory leak)
2. When the cache is full and evicts, it evicts the most-recently-used instead of least-recently-used (head/tail confusion)
3. `get` updates the access order but returns `undefined` for falsy values (0, empty string) because of a truthiness check

**Architectural smell:** The linked list and map are manipulated with raw pointer surgery instead of encapsulated node operations — every method repeats the same 5-line splice logic.

**Follow-up 1:** "There's still a memory leak under certain usage patterns. Can you identify it?" (Hint: deleted entries leave dangling prev/next references on adjacent nodes if not properly cleaned up.)

**Follow-up 2:** Add TTL support — entries expire after a configurable duration. `get` on an expired entry should return `undefined` and clean up the entry. Add a `cleanup()` method that purges all expired entries.

**Follow-up 3:** "How would you make this cache thread-safe if multiple async operations access it concurrently?"

### Broken Middleware Pipeline

**Base template (bugs to find):**
1. Middleware functions are called in reverse order (the pipeline iterates backward instead of forward)
2. A middleware that modifies the context object mutates the original — no cloning or immutability, so later middlewares see mutations from earlier ones even if the pipeline should be isolated
3. If a middleware doesn't call `next()`, the pipeline hangs silently instead of resolving

**Architectural smell:** The pipeline uses recursion without a depth limit and builds a new function chain on every request instead of composing once.

**Follow-up 1:** Add async middleware support — middleware can return a Promise. The pipeline should `await` each middleware in sequence. Existing sync middleware should still work without changes.

**Follow-up 2:** Add error-handling middleware — a middleware with the signature `(error, ctx, next)` that only runs when a previous middleware threw. Error handlers should be able to recover (call `next()` to continue) or re-throw.

**Follow-up 3:** "What changes if middlewares need to run cleanup logic after the response, like Express's `res.on('finish')`?"

### Flawed Observer Pattern

**Base template (bugs to find):**
1. Unsubscribing during notification iteration skips the next observer (classic array-mutation-during-iteration bug)
2. If `notify()` is called while another `notify()` is already in progress (re-entrant), observers are called multiple times
3. The `unsubscribe` method compares by reference but the template creates a new wrapper function on subscribe, so the reference the user gets back doesn't match what's stored

**Architectural smell:** Observers are stored in a plain array with no IDs — unsubscribe does a linear scan and uses `===` reference equality.

**Follow-up 1:** Fix both bugs while maintaining O(1) subscribe/unsubscribe. (Hint: use a Map with numeric IDs instead of an array, and snapshot the observer list before iteration.)

**Follow-up 2:** Add typed events — instead of a single observer list, support multiple event names with different payload types. `on<T>(event: string, handler: (payload: T) => void)` should be type-safe when the event map is known at compile time.

**Follow-up 3:** "What memory management concerns come up with long-lived observers? How would you detect and prevent leaks?"

---

## Design Notes

When generating from this bank:

1. **Flesh out the template.** The descriptions above are summaries. The actual TypeScript template should be 40-80 lines of realistic code with proper types, comments, and structure. Include helper functions, type aliases, and enough context that the code looks like someone's real work.

2. **Make bugs subtle.** For the code review/debugging category, bugs should require reading the code carefully. Don't make them obvious syntax issues or missing function bodies. The best bugs are ones where the code looks correct at a glance but fails under specific conditions.

3. **Vary the templates.** Even within the same problem archetype, vary the implementation details on repeat runs. Use different data structures in the template, different naming conventions, different amounts of starter code. The problem statement stays the same but the code the candidate starts with should feel fresh.

4. **Follow-ups should reference the candidate's code.** When delivering a follow-up, reference specific functions or decisions from what the candidate wrote. "I see you used a Map here — what if we needed to preserve insertion order?" is better than a generic "add feature X."

5. **Invent new problems freely.** This bank is a starting point. Any problem that maps to "working-but-brittle template → organic extension → constraint that exposes brittleness" works. Examples: dependency resolver, pub/sub message broker, configuration registry, permission evaluator, template engine, cron expression parser.
