---
name: ink
description: "Best practices for building terminal UIs with Ink (React for CLIs). Use this skill when writing Ink components, laying out terminal interfaces with Box/Text, handling keyboard input, building animations, or setting up a new Ink project. Triggers on: Ink components (Box, Text, Transform, Static, Newline), ink imports, terminal UI layout, CLI component architecture, useInput/useApp hooks, or any React-in-the-terminal work. Also use when the user mentions building a CLI with React, terminal rendering, or references the ink npm package."
---

# Ink — React for the Terminal

Ink renders React components to terminal output using Yoga (flexbox) for layout. `<Box>` replaces `<div>`, `<Text>` replaces `<span>`. The terminal is the viewport; rows are height, columns are width. Every element is `display: flex` — there is no block layout.

Used in production by Claude Code, Gemini CLI, Cloudflare Wrangler, Shopify CLI, Prisma, Gatsby, Yarn 2, and 40+ other major CLIs.

## Project Setup

Ink 6.x requires ESM and pairs with React 19.x.

```jsonc
// package.json
{ "type": "module" }
```

```jsonc
// tsconfig.json (key fields)
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "jsx": "react-jsx",    // automatic runtime — never import React
    "strict": true
  }
}
```

NodeNext resolution requires `.js` extensions on all local imports, even for `.tsx` source files:

```tsx
import { App } from "./app.js";         // correct
import { App } from "./app";            // breaks at runtime
```

## The Static/Dynamic Split

This is the most important architectural pattern in production Ink apps. Ink performs full-tree traversal and complete screen redraws on every state change. Without mitigation, a CLI displaying hundreds of log lines redraws all of them on every tick.

Split the UI into two zones:

```tsx
<>
  <Static items={completedTasks}>
    {task => <Text key={task.id}>{task.status} {task.name}</Text>}
  </Static>
  <Box>
    <Spinner /> <Text>Running {currentTask}...</Text>
  </Box>
</>
```

- **`<Static>`** — Content rendered once and permanently frozen above the dynamic area. Never re-renders. Use for: completed tasks, build output, test results, log lines, streamed messages.
- **Dynamic area** — Everything below `<Static>`. Re-renders freely for spinners, progress bars, current status.

Items passed to `<Static>` must be referentially stable — it compares by reference to detect new entries. Append new items; never replace the array.

```tsx
// Correct: functional updater preserves reference stability
setLogs(prev => [...prev, newEntry]);

// Wrong: stale closure captures old array
setLogs([...logs, newEntry]);
```

This stale-closure pattern is the most common bug in streaming Ink apps.

## Render Lifecycle

```tsx
import { render } from "ink";

const instance = render(<App />, {
  exitOnCtrlC: true,          // auto-exit on Ctrl+C (default: true)
  patchConsole: true,          // intercept console.log (default: true)
  alternateScreen: false,      // fullscreen mode
  incrementalRendering: false, // only update changed lines (v6+)
});

await instance.waitUntilExit();
// Safe to log, close DB connections, clean up temp files
```

**Key options:**

- **`exitOnCtrlC: false`** — Use when you need custom cleanup before exit. Handle Ctrl+C yourself:

```tsx
const { exit } = useApp();
useInput((input, key) => {
  if (key.ctrl && input === "c") {
    cleanup();
    exit();
  }
});
```

- **`incrementalRendering: true`** — Only redraws changed lines instead of the full screen. Significantly reduces flickering, especially in tmux.

- **`waitUntilExit()`** — Returns a Promise that resolves after unmount completes. Always await this before post-render work (logging, process.exit, etc.) — otherwise you race Ink's cleanup.

- **`alternateScreen: true`** — Enters a separate terminal buffer (like vim). On exit, restores the original screen contents. Good for fullscreen apps.

## Layout with Box

`<Box>` is the only layout primitive. Default direction is row.

```tsx
// Vertical stack with spacing
<Box flexDirection="column" gap={1}>
  <Text>First</Text>
  <Text>Second</Text>
</Box>

// Centered horizontal row that wraps on narrow terminals
<Box flexDirection="row" flexWrap="wrap" gap={1} justifyContent="center">
  {items.map(item => <Card key={item.id} />)}
</Box>
```

### Padding and Dimensions

```tsx
<Box paddingX={2} paddingY={1}>      {/* 2 cols left+right, 1 row top+bottom */}
<Box height={17} width={28}>          {/* fixed rows × columns */}
```

Set explicit dimensions when layout stability matters — particularly for elements that transition between states (hidden → visible, loading → loaded).

### Borders

```tsx
<Box borderStyle="round" borderColor="cyan" paddingX={1}>
```

Styles: `"single"`, `"double"`, `"round"`, `"bold"`, `"singleDouble"`, `"doubleSingle"`, `"classic"`, or a custom character object. Border is drawn outside padding, inside dimensions — a `height={5}` box with a border has 3 usable interior rows.

### Spacers

Use `<Box flexGrow={1} />` (or the `<Spacer />` component) as an expanding spacer:

```tsx
<Box flexDirection="column" height={17}>
  <Text>Top</Text>
  <Box flexGrow={1} />
  <Text>Centered</Text>
  <Box flexGrow={1} />
</Box>
```

## Text

All visible characters must be inside a `<Text>`. Raw strings in `<Box>` will error.

```tsx
<Text bold color="magenta">Header</Text>
<Text dimColor>Secondary info</Text>
<Text italic wrap="wrap">{longPassage}</Text>
```

Colors accept named colors, hex, or rgb. `dimColor` reduces brightness without changing the hue.

Nest `<Text>` for inline style changes — the only component that supports inline nesting:

```tsx
<Text dimColor>
  Status: <Text color="green">ready</Text>
</Text>
```

Do not nest `<Box>` inside `<Text>`.

### Blank Lines and Spacing

Prefer `gap` on the parent `<Box>` for structural spacing between siblings. Use `<Newline />` only for intentional whitespace within a text flow. Avoid empty Text nodes or `{"\n"}`.

## Hooks

### useApp — Exit Control

```tsx
const { exit } = useApp();

useEffect(() => {
  if (done) {
    const id = setTimeout(() => exit(), 100);  // let final render complete
    return () => clearTimeout(id);
  }
}, [done, exit]);
```

Pass an `Error` to `exit(error)` to make `waitUntilExit()` reject — allows the caller to handle failures.

### useInput — Keyboard Handling

```tsx
useInput(
  (input, key) => {
    if (key.return) submit();
    if (key.escape) cancel();
    if (input === "q") quit();
  },
  { isActive: isFocused && !loading }
);
```

**Always use `isActive`** when the handler should only run conditionally. Without it, every `useInput` in the tree fires on every keypress — this is the source of most input-related bugs in multi-component UIs.

Guard for TTY in non-interactive contexts:

```tsx
{ isActive: process.stdin.isTTY === true && !done }
```

### useWindowSize — Responsive Layouts

```tsx
const { width, height } = useWindowSize();
```

Re-renders on terminal resize. Use for responsive layouts instead of reading `stdout.columns` directly.

### useFocus — Tab Navigation

```tsx
const { isFocused } = useFocus({ autoFocus: true });
```

Tab cycles focus between focusable components. Combine with `useInput`'s `isActive: isFocused` for scoped input handling. Use `useFocusManager()` for programmatic focus control.

## Non-TTY and CI Environments

Ink detects CI environments automatically and renders only the final frame instead of continuously updating. Components should also check:

```tsx
const { isRawModeSupported } = useStdin();

if (!isRawModeSupported) {
  return <Text>Using defaults (non-interactive mode)</Text>;
}
return <InteractivePrompt />;
```

For CLIs that need both interactive and machine-readable output:

```tsx
if (process.argv.includes("--json")) {
  process.stdout.write(JSON.stringify(data, null, 2) + "\n");
} else {
  render(<App data={data} />);
}
```

## Performance

Ink redraws the entire dynamic area on every state change. Strategies to minimize flickering:

1. **Use `<Static>` aggressively** — move all immutable output out of the dynamic area
2. **Enable `incrementalRendering: true`** — only updates changed lines (v6+)
3. **Batch state updates** — don't `setState` on every stream chunk; accumulate and flush
4. **Memoize derived state** — `useMemo` for expensive computations, `React.memo` for pure components
5. **Use refs for high-frequency state** — animation ticks, frame counters, and similar rapid updates should live in `useRef`, not `useState`. Derive the visible state and `setState` once per frame.

## Error Handling

React error boundaries work in Ink. Ink also wraps apps in a built-in error boundary that renders a formatted error overview instead of raw stack traces.

For async errors:

```tsx
const { exit } = useApp();
useEffect(() => {
  fetchData().catch(error => exit(error));
}, []);
```

Errors passed to `exit()` cause `waitUntilExit()` to reject, allowing the caller to handle them.

## Testing

Use `ink-testing-library` (inspired by react-testing-library):

```tsx
import { render } from "ink-testing-library";

const { lastFrame, stdin } = render(<MyApp />);
expect(lastFrame()).toContain("Welcome");

stdin.write("hello");
stdin.write("\r");  // Enter
expect(lastFrame()).toContain("Done!");
```

For snapshot-style tests without a terminal:

```tsx
import { renderToString } from "ink";
const output = renderToString(<MyComponent />, { columns: 80 });
```

## Ecosystem

### @inkjs/ui — Official Component Library

The `@inkjs/ui` package provides production-ready components with a theme system:

| Component | Purpose |
|-----------|---------|
| `TextInput` | Single-line text with optional autocomplete |
| `PasswordInput` | Masked input |
| `ConfirmInput` | Y/n prompt |
| `Select` | Scrollable single-select list |
| `MultiSelect` | Multiple selections |
| `Spinner` | Animated loading indicator with label |
| `ProgressBar` | Percentage-based progress |
| `Badge` | Status indicator (success/error/warning/info) |
| `StatusMessage` | Formatted status messages |
| `Alert` | High-priority status messages |

Prefer `@inkjs/ui` components over community alternatives — they integrate with Ink's focus system and theme provider.

### Other Useful Packages

| Package | Purpose |
|---------|---------|
| `ink-link` | Clickable terminal hyperlinks |
| `ink-gradient` | Gradient text coloring |
| `ink-big-text` | Large ASCII art text |
| `ink-table` | Tabular data display |
| `figures` | Cross-platform Unicode symbols |
| `chalk` | String-level color (for non-component contexts) |

### Pastel — Framework for Larger CLIs

For CLIs with multiple commands, Pastel provides file-based routing (like Next.js for terminals). Files in `commands/` become commands; Zod schemas define options with auto-generated help.

## Common Mistakes

1. **Not using `<Static>` for log output** — The #1 performance mistake. Every state change redraws the entire dynamic area. Completed/permanent output belongs in `<Static>`.

2. **Stale closures in streaming loops** — `for await (const chunk of stream) { setItems([...items, chunk]) }` captures stale `items`. Use the functional updater: `setItems(prev => [...prev, chunk])`.

3. **Forgetting `isActive` on `useInput`** — Without it, all `useInput` hooks fire simultaneously on every keypress.

4. **Not checking `isRawModeSupported`** — Crashes in CI/pipe environments when Ink tries `setRawMode()` on non-TTY stdin.

5. **Treating terminal as browser** — Every element is `display: flex`. There is no block layout. Expecting block-level flow leads to confused layouts.

6. **Text outside `<Text>`** — `<Box>hello</Box>` errors. All visible characters must be in `<Text>`.

7. **Logging after unmount without `waitUntilExit()`** — Output may appear before cursor restoration. Always await `waitUntilExit()` before post-render work.

8. **Leaking intervals** — Clear the interval when animation completes, not just on unmount. Otherwise the loop runs indefinitely after the work is done.

For the full component/hook prop reference, read `references/api.md`.
