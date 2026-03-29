# Ink API Reference

Quick-reference for Ink 6.x exports. Read this when you need exact prop names, hook signatures, or render options.

## Table of Contents

1. [render()](#render)
2. [Box](#box)
3. [Text](#text)
4. [Newline](#newline)
5. [Spacer](#spacer)
6. [Static](#static)
7. [Transform](#transform)
8. [Hooks](#hooks)
9. [@inkjs/ui Components](#inkjsui-components)
10. [Testing](#testing)

---

## render()

```tsx
import { render } from "ink";

const instance = render(<App />, options?);
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `stdout` | `WriteStream` | `process.stdout` | Output stream |
| `stdin` | `ReadStream` | `process.stdin` | Input stream |
| `stderr` | `WriteStream` | `process.stderr` | Error stream |
| `exitOnCtrlC` | `boolean` | `true` | Auto-exit on Ctrl+C |
| `patchConsole` | `boolean` | `true` | Intercept console.log to prevent output corruption |
| `alternateScreen` | `boolean` | `false` | Fullscreen mode (like vim) |
| `incrementalRendering` | `boolean` | `false` | Only redraw changed lines |
| `debug` | `boolean` | `false` | Render each update as separate output |
| `concurrent` | `boolean` | `false` | React Concurrent Mode |
| `maxFps` | `number` | — | Throttle render rate |
| `kittyKeyboard` | `boolean` | — | Kitty keyboard protocol (v6.7+) |
| `onRender` | `(metrics) => void` | — | Callback with render timing |

### Instance Methods

```tsx
instance.unmount();             // unmount the component tree
instance.waitUntilExit();       // Promise<void> — resolves after cleanup
instance.rerender(<App />);     // update with new element
instance.clear();               // clear terminal output
```

### renderToString()

```tsx
import { renderToString } from "ink";
const output = renderToString(<MyComponent />, { columns: 80 });
```

Synchronous render to string. No stdin, no terminal events, hooks return no-op defaults. Use for testing and non-interactive output.

---

## Box

Layout container. Flexbox via Yoga.

### Dimensions

| Prop | Type | Description |
|------|------|-------------|
| `width` | `number \| string` | Columns. String for percentage (`"50%"`) |
| `height` | `number \| string` | Rows |
| `minWidth` | `number` | Minimum width |
| `minHeight` | `number` | Minimum height |

### Padding

| Prop | Type |
|------|------|
| `padding` | `number` — all sides |
| `paddingX` | `number` — left + right |
| `paddingY` | `number` — top + bottom |
| `paddingTop` | `number` |
| `paddingBottom` | `number` |
| `paddingLeft` | `number` |
| `paddingRight` | `number` |

Margin follows the same pattern: `margin`, `marginX`, `marginY`, `marginTop`, etc.

### Flex

| Prop | Type | Default |
|------|------|---------|
| `flexDirection` | `"row" \| "column" \| "row-reverse" \| "column-reverse"` | `"row"` |
| `flexGrow` | `number` | `0` |
| `flexShrink` | `number` | `1` |
| `flexBasis` | `number \| string` | — |
| `flexWrap` | `"wrap" \| "nowrap" \| "wrap-reverse"` | `"nowrap"` |
| `alignItems` | `"flex-start" \| "center" \| "flex-end" \| "stretch"` | `"stretch"` |
| `alignSelf` | `"auto" \| "flex-start" \| "center" \| "flex-end" \| "stretch"` | — |
| `justifyContent` | `"flex-start" \| "center" \| "flex-end" \| "space-between" \| "space-around" \| "space-evenly"` | `"flex-start"` |
| `gap` | `number` | — |
| `rowGap` | `number` | — |
| `columnGap` | `number` | — |

### Border

| Prop | Type |
|------|------|
| `borderStyle` | `"single" \| "double" \| "round" \| "bold" \| "singleDouble" \| "doubleSingle" \| "classic" \| BorderObject` |
| `borderColor` | `string` — all borders |
| `borderTopColor` | `string` |
| `borderBottomColor` | `string` |
| `borderLeftColor` | `string` |
| `borderRightColor` | `string` |
| `borderDimColor` | `boolean` |

`BorderObject`: `{ topLeft, top, topRight, left, right, bottomLeft, bottom, bottomRight }` — each a single character.

### Display

| Prop | Type | Default |
|------|------|---------|
| `display` | `"flex" \| "none"` | `"flex"` |
| `overflow` | `"visible" \| "hidden"` | `"visible"` |

---

## Text

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `color` | `string` | — | Named, hex, or rgb |
| `backgroundColor` | `string` | — | Background color |
| `dimColor` | `boolean` | `false` | Reduce brightness |
| `bold` | `boolean` | `false` | |
| `italic` | `boolean` | `false` | |
| `underline` | `boolean` | `false` | |
| `strikethrough` | `boolean` | `false` | |
| `inverse` | `boolean` | `false` | Swap fg/bg |
| `wrap` | `"wrap" \| "truncate" \| "truncate-start" \| "truncate-middle" \| "truncate-end"` | `"wrap"` | |

Named colors: `black`, `red`, `green`, `yellow`, `blue`, `magenta`, `cyan`, `white`, `gray`/`grey`, and bright variants (`blackBright`, `redBright`, etc.).

---

## Newline

Renders a blank line. No props. Use for intentional vertical whitespace within text flow; prefer `gap` for structural spacing.

## Spacer

Shorthand for `<Box flexGrow={1} />`.

## Static

```tsx
<Static items={items}>
  {(item, index) => <Text key={item.id}>{item.text}</Text>}
</Static>
```

Items rendered once and frozen. Compares by reference — never replace the array, only append. Also accepts `style` (Box styles) for the container.

## Transform

```tsx
<Transform transform={(content: string) => modifiedContent}>
  {children}
</Transform>
```

`content` includes ANSI escape codes. Account for them when slicing or measuring visible characters.

---

## Hooks

### useApp

```tsx
const { exit } = useApp();
exit(error?: Error);  // unmounts; error causes waitUntilExit() to reject
```

### useInput

```tsx
useInput(
  (input: string, key: Key) => void,
  options?: { isActive?: boolean }
);
```

Key shape: `{ return, escape, tab, backspace, delete, upArrow, downArrow, leftArrow, rightArrow, pageUp, pageDown, home, end, ctrl, shift, meta }` — all `boolean`.

### useStdin

```tsx
const { stdin, isRawModeSupported, setRawMode } = useStdin();
```

Check `isRawModeSupported` before interactive features — it's `false` in CI/pipe environments.

### useStdout / useStderr

```tsx
const { stdout, write } = useStdout();
const { stderr, write } = useStderr();
```

`write()` outputs text while preserving Ink's rendering.

### useWindowSize

```tsx
const { width, height } = useWindowSize();
```

Re-renders on terminal resize.

### useFocus

```tsx
const { isFocused } = useFocus({
  autoFocus?: boolean,   // default: false
  isActive?: boolean,    // default: true
  id?: string,
});
```

### useFocusManager

```tsx
const { focusNext, focusPrevious, focus, enableFocus, disableFocus } = useFocusManager();
focus(id: string);
```

### useBoxMetrics

Returns layout metrics (width, height, position) for a Box via ref.

### useCursor

Cursor position control (for IME support).

### usePaste

Detects paste events (multi-character input in a single callback).

---

## @inkjs/ui Components

Official component library with a theme system (`ThemeProvider`, `extendTheme()`).

### Input

| Component | Props | Description |
|-----------|-------|-------------|
| `TextInput` | `value`, `onChange`, `placeholder`, `suggestions?` | Single-line text, optional autocomplete |
| `EmailInput` | `value`, `onChange`, `placeholder`, `domains?` | Domain autocomplete after `@` |
| `PasswordInput` | `value`, `onChange`, `placeholder` | Masked with asterisks |
| `ConfirmInput` | `onConfirm`, `onCancel`, `defaultChoice?` | Y/n prompt |
| `Select` | `options`, `onChange`, `highlightText?`, `visibleOptionCount?` | Scrollable single-select |
| `MultiSelect` | `options`, `onChange`, `highlightText?`, `visibleOptionCount?` | Multiple selections |

### Feedback

| Component | Props | Description |
|-----------|-------|-------------|
| `Spinner` | `label?` | Animated loading indicator |
| `ProgressBar` | `value` (0-100) | Percentage bar |
| `Badge` | `color` (`"green" \| "red" \| "yellow" \| "blue"`) | Status indicator |
| `StatusMessage` | `variant` (`"success" \| "error" \| "warning" \| "info"`) | Formatted status |
| `Alert` | `variant`, `title?` | High-priority message |

### Lists

`UnorderedList`, `OrderedList` — with nesting support via `UnorderedList.Item` / `OrderedList.Item`.

---

## Testing

### ink-testing-library

```tsx
import { render } from "ink-testing-library";

const { lastFrame, frames, stdin, rerender, unmount } = render(<App />);

expect(lastFrame()).toContain("Welcome");
stdin.write("hello\r");
expect(lastFrame()).toContain("Done");
```

- `lastFrame()` — current rendered output
- `frames` — all rendered frames (array)
- `stdin.write()` — simulate input
- `rerender(<App newProp />)` — update props
- `unmount()` — unmount the tree
