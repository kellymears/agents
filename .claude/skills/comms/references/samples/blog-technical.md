# Samples: Technical Blog Post

From "The Signal in a Reducer" — opinionated technical argument with code examples and clear scope.

---

Opening:

> `Array.prototype.reduce` has a discourse problem. Some people use it for everything. Others think you should never use it at all. Both camps treat it as a matter of style. It isn't. It's a signal.

Core argument:

> When I see `.reduce()`, it tells me something a `for` loop doesn't: _a transformation between types is happening_. An array is becoming a number, a lookup table, a tree. Same reason we use `map` instead of a `for` loop that pushes into an array — the method communicates intent at the expression level, not the statement level.

Analogy from colleague:

> A colleague of mine uses `let` instead of `const` when declaring an object he intends to mutate in scope. The language doesn't require it — but it's a consistent signal: _this data is going to change_.

Acknowledging limits:

> Reduce has one, and it's easy to fall off. Nested reduces are almost always wrong. If the callback exceeds three or four lines, extract it. If the accumulator type isn't obvious from the seed value, annotate it — TypeScript's inference on `reduce` is unreliable.

Closing:

> Use reduce when it communicates something a loop can't: _a new shape is being built from an old one_. When it does that clearly, it's worth it. When it doesn't, use a loop.

---

Notice:
- Opens with the discourse, takes a position immediately
- "It isn't. It's a signal." — two fragments that reframe the entire post
- Code shown, not described — side-by-side comparisons
- Names the tradeoffs: "TypeScript's inference on `reduce` is unreliable"
- Closing restates the thesis in its sharpest form, then gives the practical inverse
- No "In conclusion" — the last substantive thought IS the conclusion
- Headers used for navigation in a longer piece (this is a technical reference)
- Summary in frontmatter: "Reducers get a bad rap. Here's why I still reach for them — and when I don't."
