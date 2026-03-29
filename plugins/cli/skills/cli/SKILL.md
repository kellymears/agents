---
name: cli
description: >
  CLI design best practices based on clig.dev — covers argument/flag design,
  help text, output formatting, error handling, configuration, signals, and
  robustness. Use this skill when building CLI tools, adding commands or flags,
  designing help output, formatting terminal output, handling CLI errors,
  reviewing CLI UX, or making any decisions about how a command-line program
  interacts with its users. Also trigger when working with argument parsers
  (yargs, commander, clap, cobra, click, argparse), exit codes, stdin/stdout
  patterns, progress indicators, or interactive prompts. If the user is building
  anything that runs in a terminal, this skill probably applies.
---

# CLI Design Guidelines

Best practices for building command-line tools that respect users. Based on the [Command Line Interface Guidelines](https://clig.dev/) by Aanand Prasad, Ben Firshman, Carl Tashian, and Eva Parish.

The full reference lives at `references/clig-guidelines.md` — read the relevant section when you need the complete recommendation list for a specific topic. This file is a decision framework for the most impactful guidelines.

## Core Principle

Design for humans first. The person at the terminal is exploring, iterating, making mistakes. The CLI should feel like a conversation, not a contract. Acknowledge what happened, suggest what to do next, and never leave the user wondering.

## Designing Commands

When adding commands, flags, or arguments to a CLI:

**Prefer flags over positional arguments.** Flags are self-documenting and order-independent. Positional arguments are fine for one or two obvious operands (file paths), but if you need `myapp source dest format`, those should be flags.

**Use standard flag names.** These are conventions users already know:

| Flag | Meaning |
|---|---|
| `-h`, `--help` | Help (never use `-h` for anything else) |
| `-v`, `--version` | Version |
| `-f`, `--force` | Skip confirmation |
| `-n`, `--dry-run` | Preview without executing |
| `-q`, `--quiet` | Suppress non-essential output |
| `--json` | JSON output |
| `--no-color` | Disable color |
| `--no-input` | Disable interactive prompts |

See `references/clig-guidelines.md` → "Arguments and Flags" for the complete table.

**Reserve short flags for frequent operations.** The single-letter namespace is small. Don't burn `-p` on a rarely-used option.

**Make order irrelevant.** `mycmd subcmd --flag` and `mycmd --flag subcmd` should both work.

**Never accept secrets via flags.** Visible in `ps` and shell history. Use `--password-file`, stdin, or a credential manager.

**Confirm destructive operations proportional to severity.** Minor local change: optional. Major remote change: prompt, consider dry-run preview. Irreversible deletion: require typing the resource name or a dedicated flag like `--yes-delete-everything`.

## Writing Help Text

**Lead with examples.** Users learn faster from `myapp clone https://example.com/repo` than from a flag reference table. Show realistic invocations with expected output.

**Show concise help when no arguments are given.** Description, one or two examples, common flags, and a pointer to `--help`.

**All of these should work:**
```
myapp
myapp -h
myapp --help
myapp help
myapp help <subcommand>
myapp <subcommand> --help
```

**List common commands/flags first,** then the exhaustive list. Most users need the top five.

**Include a repo or website link** in top-level help.

## Formatting Output

**Human-readable by default, machine-readable by flag.** Detect TTY: when interactive, use color, alignment, and tables. When piped, emit clean data. Provide `--json` for structured output and `--plain` for stripped formatting.

**Acknowledge state changes.** Brief confirmation on success ("Created backup.") prevents users from wondering whether anything happened.

**Suggest next commands.** `git status` is the gold standard — it shows state and the commands to change it.

**Color rules:**
- Disable on non-TTY, when `NO_COLOR` is set, when `TERM=dumb`, or with `--no-color`.
- Never use color as the only signifier — pair with symbols or text.

**Disable animations when piped.** No progress bars or spinners if stdout isn't a TTY.

**Use stderr for messaging; stdout for data.** This separation makes piping work. Downstream commands get data, not status messages.

**Page long output to a TTY.** Use `less -FIRX` or your language's pager library.

See `references/clig-guidelines.md` → "Output" for the full set of output guidelines.

## Handling Errors

**Rewrite errors for humans.** Catch expected errors and explain them with solutions:
```
Can't write to file.txt. Make it writable with: chmod +w file.txt
```
Don't surface raw stack traces or cryptic error codes.

**Put the most important information last.** It's what the user sees when the command finishes — closest to their cursor.

**Provide debug info for unexpected errors.** Traceback, version, OS. Consider writing debug logs to a file. Pre-populate bug report URLs with context.

**Return meaningful exit codes.** Zero on success, non-zero on failure. Map distinct failure modes to distinct codes for script evaluation.

## Configuration

Three tiers, each with the right mechanism:

1. **Per-invocation** (debug, dry-run, output format) → Flags, optionally env vars.
2. **Machine-specific** (cache path, proxy, color) → Flags, env vars, or `.env` files.
3. **Project-stable** (build config, linter rules) → Dedicated config files.

**Precedence** (highest to lowest): flags → env vars → project config → user config (`~/.config/`) → system config (`/etc/`).

**Follow XDG Base Directory Spec.** Use `~/.config/<appname>/` instead of dotfiles in `$HOME`. Respect `$XDG_CONFIG_HOME`.

**Respect standard env vars:** `NO_COLOR`, `FORCE_COLOR`, `DEBUG`, `EDITOR`, `HTTP_PROXY`/`HTTPS_PROXY`, `TERM`, `TMPDIR`, `HOME`, `PAGER`, `LINES`/`COLUMNS`.

**Never read secrets from env vars.** They leak through child processes, `ps`, Docker inspect, and shell history.

See `references/clig-guidelines.md` → "Configuration" and "Environment Variables" for the complete reference.

## Robustness

**Print something within 100ms.** If startup takes longer, show a spinner. Always indicate before network requests.

**Show progress.** Spinners for indeterminate waits. Progress bars for measurable progress. Animate to prove the program hasn't hung.

**Set network timeouts.** Don't let a dead server hang the user's terminal.

**Design for recoverability.** Idempotent operations. Resume capability. The user should be able to re-run after failure.

**Prefer crash-only design.** Defer cleanup to next run. Exit on failure rather than attempting fragile recovery.

**Handle Ctrl-C gracefully.** Print relevant output, then exit. Support double Ctrl-C — first press for graceful shutdown, second to force-quit:
```
^CGracefully stopping... (press Ctrl+C again to force)
```

## Future-proofing

**Make additive changes only.** Add flags and subcommands; don't change existing behavior.

**Don't expand abbreviations.** `i` matching `install` breaks when you add `init`.

**Don't create catch-all subcommands.** `mycmd echo` meaning `mycmd run echo` blocks you from ever adding an `echo` command.

**Human-readable output can change.** That's the contract — scripts use `--json` or `--plain` for stable formats.

## Naming

**Lowercase with dashes.** `my-tool`, not `MyTool`.

**Simple, memorable, non-generic.** Avoid namespace collisions. "convert" is too common; pick something distinctive.

**Optimize for typing comfort.** Consider keyboard flow and hand mechanics.

## Review Checklist

When reviewing CLI code or designing a new command, check these:

- [ ] Exits 0 on success, non-zero on failure
- [ ] Primary output on stdout, messages on stderr
- [ ] `-h`/`--help` works on every command and subcommand
- [ ] No arguments → concise help (not an error, not a hang)
- [ ] Uses standard flag names where applicable
- [ ] No secrets accepted via flags
- [ ] TTY detection for color, formatting, and prompts
- [ ] `NO_COLOR` and `--no-color` respected
- [ ] Animations/progress bars disabled when piped
- [ ] Destructive operations confirmed proportional to severity
- [ ] Errors are human-readable with suggested fixes
- [ ] First output within 100ms
- [ ] Network requests have timeouts
- [ ] Ctrl-C exits cleanly
- [ ] No abbreviation expansion in subcommand matching
- [ ] Config precedence: flags > env > project > user > system
