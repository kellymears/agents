# Command Line Interface Guidelines — Full Reference

Compiled from [clig.dev](https://clig.dev/), an open-source guide by Aanand Prasad, Ben Firshman, Carl Tashian, and Eva Parish.

This reference preserves every actionable recommendation from the original. Section structure mirrors the source document. Consult this file when you need the complete guideline for a specific topic — the SKILL.md provides the decision framework and points here for details.

---

## Philosophy

Nine principles frame the guidelines.

### Human-first design

CLIs should prioritize human users, not programs. The historical UNIX assumption of program-to-program communication still matters, but modern CLIs serve people typing at terminals. Design for humans first, then ensure machine-readability through explicit flags.

### Simple parts that work together

Composability through established conventions: stdin/stdout/stderr, signals, exit codes, text-based output. Programs that follow these conventions get pipeline integration for free.

### Consistency across programs

Terminal conventions become intuitive through repetition. `--help` should always mean help. `-v` shouldn't mean "verbose" in one tool and "version" in another. When usability genuinely demands breaking a convention, do it deliberately.

### Saying (just) enough

Too little output leaves users unsure whether anything happened. Too much drowns the signal. Find the balance — acknowledge state changes, hide noise, surface what matters.

### Ease of discovery

GUIs advertise features visually. CLIs must achieve discoverability through comprehensive help text, examples, and suggestions. Users shouldn't need to read docs before they can explore.

### Conversation as the norm

CLI interaction is dialogue. Users iterate through trial-and-error, building understanding progressively. Design for this exploratory pattern — don't assume users will execute a single perfect command.

### Robustness

Two dimensions: objective (handles unexpected input gracefully) and subjective (feels stable and responsive). Both require attention to detail and simplicity.

### Empathy

Tools should convey that their developers anticipated user problems. Exceed expectations — helpful error messages, sensible defaults, thoughtful confirmation prompts.

### Chaos

Terminal inconsistencies enable invention. Sometimes breaking rules is justified when the alternative is demonstrably harmful to productivity. This is permission to innovate, not permission to be sloppy.

---

## The Basics

**Use an argument-parsing library.** Don't hand-roll flag parsing. Use your language's standard library or a well-maintained third-party option (docopt, Cobra, Click, clap, etc.). These handle argument parsing, help text generation, tab completion, and typo suggestions.

**Return zero on success, non-zero on failure.** Map exit codes to distinct failure modes so scripts can evaluate results programmatically.

**stdout is for primary output. stderr is for messaging and errors.** This separation enables piping — downstream commands receive data, not status messages. If stdout is redirected or piped, stderr still reaches the user's terminal.

---

## Help

**Display help with `-h` and `--help`.** Support both short and long forms for every subcommand.

**Show concise help when no arguments are provided.** If a command requires arguments but receives none, display: a description, one or two example invocations, common flags (unless there are too many to list), and a pointer to `--help` for the full listing.

**All of these should work:**

```
$ myapp
$ myapp --help
$ myapp -h
$ myapp help
$ myapp help subcommand
$ myapp subcommand --help
```

**Include a website or repo link** in top-level help output.

**Link to detailed docs** from help text when web documentation exists.

**Lead with examples.** Users learn from examples faster than from abstract flag descriptions. Show real invocations with realistic output.

**List common flags and commands first,** before the comprehensive listing. Most users need the top 5 options, not all 40.

**Format help text for terminals.** Use bold for headings. Ensure formatting degrades cleanly when piped (no raw escape sequences in piped output).

**Suggest corrections for typos.** When users mistype a command or flag, suggest the closest match. Ask permission before executing the suggestion. Never auto-correct destructive operations.

```
$ heroku pss
 ›   Warning: pss is not a heroku command.
Did you mean ps? [y/n]:
```

**Don't hang on piped stdin.** If the program expects interactive input but stdin is not a TTY (it's being piped), display help and exit immediately.

---

## Documentation

Help text and documentation serve different purposes. Help is brief and immediate. Documentation is comprehensive and detailed.

**Provide web-based documentation.** Enables search, linking, and sharing.

**Provide terminal-based documentation.** Faster access, version-synchronized with the installed binary, works offline.

**Support man pages** where appropriate — `man mycmd` is deeply ingrained muscle memory for many users.

**Feature examples prominently.** Users learn from examples first, reference docs second. Show commands with their output.

**Keep extensive examples out of `--help` output.** Long example sets belong in cheat sheets or web documentation to avoid bloating the built-in help.

---

## Output

**Human-readable by default.** Detect whether stdout is a TTY. When it is, format for humans — colors, alignment, tables. When piped, output clean data.

**Enable machine-readable output explicitly:**

- `--plain` — disables human formatting (multi-line table cells, color, highlighting) for `grep`/`awk` compatibility.
- `--json` — outputs structured JSON compatible with `jq` and web service integration.

**Acknowledge state changes.** Don't be silent on success like traditional UNIX. A brief confirmation ("Created database backup.") prevents users from wondering whether the command actually did anything.

**Support quiet mode.** `-q`/`--quiet` suppresses non-essential output for scripts that only care about exit codes.

**Make current state easy to view.** The equivalent of `git status` — users should always be able to ask "where am I?" and get a useful answer.

**Suggest next commands.** When appropriate, output tells the user what they might want to do next. `git status` is the canonical example — it shows both the state and the commands to change it.

**Be explicit about side effects.** Make it visible when the program reads/writes files not specified as arguments, or contacts remote servers. No silent network calls.

**Use visual structure for information density.** Align columns, use box drawing, exploit spatial patterns to make output scannable:

```
-rw-r--r-- 1 root root     68 Aug 22 23:20 resolv.conf
lrwxrwxrwx 1 root root     13 Mar 14 20:24 rmt -> /usr/sbin/rmt
drwxr-xr-x 4 root root   4.0K Jul 20 14:51 security
```

**Color guidelines:**

- Use intentionally for highlighting, not decoration.
- Disable when stdout is not a TTY.
- Respect the `NO_COLOR` environment variable.
- Respect `TERM=dumb`.
- Support `--no-color` flag.
- Don't use color as the only signifier — pair with symbols or text.

**Disable animations when piped.** No progress bars or spinners if stdout isn't a TTY.

**Use symbols and emoji strategically.** They add visual structure and draw attention, but overuse becomes noise:

```
🔐 The PIN is up to 8 numbers, letters, or symbols. Not just numbers!
❌ The key will be lost if the PIN and PUK are locked after 3 incorrect tries.
✅ Done! This YubiKey is secured and ready to go.
```

**Hide developer/debug output from users.** Reserve for `--verbose` or `--debug` mode.

**Keep stderr clean.** No log-level labels (`ERR`, `WARN`) or excessive contextual information unless in verbose mode.

**Page long output.** For TTY output that exceeds the terminal height, pipe through a pager. Use `less -FIRX` (quit-if-one-screen, ignore-case, raw-control-chars, don't-clear-screen).

---

## Errors

**Rewrite errors for humans.** Catch expected errors and explain them conversationally, with solutions:

> "Can't write to file.txt. Make it writable with `chmod +w file.txt`."

Don't dump raw stack traces or cryptic error codes at users.

**Manage signal-to-noise.** Group similar errors under explanatory headers. Place the most critical information at the end of output (it's what users see last, and it's closest to their cursor).

**Provide debug info for unexpected errors.** Include traceback/debug data and instructions for reporting the bug. Consider writing debug logs to a file rather than the terminal.

**Make bug reporting effortless.** Pre-populate issue URLs with as much context as possible — version, OS, error details.

---

## Arguments and Flags

**Terminology:**

- _Arguments_ are positional; order matters. (`cp source dest`)
- _Flags_ are named with `-letter` or `--word` syntax; order-independent. (`--force`, `-f`)

**Prefer flags over arguments.** Flags are self-documenting, easier to modify in the future, and can be required or optional independently.

**Provide both short and long forms.** `-h` and `--help`. Short for interactive typing; long for scripts where readability matters.

**Reserve single-letter flags for common operations.** Don't burn short flags on obscure options. The short-flag namespace is small.

**Multiple arguments of the same type are fine.** `rm file1 file2 file3` and globbing (`rm *.txt`) should work.

**Two or more different-purpose arguments signal a design problem.** If you need `myapp source destination format`, those should be flags.

**Standard flag conventions:**

| Flag              | Meaning                                         |
| ----------------- | ----------------------------------------------- |
| `-a`, `--all`     | Include everything                              |
| `-d`, `--debug`   | Debugging output                                |
| `-f`, `--force`   | Force without confirmation                      |
| `--json`          | JSON output                                     |
| `-h`, `--help`    | Help (exclusive meaning)                        |
| `-n`, `--dry-run` | Preview without executing                       |
| `--no-input`      | Disable all interactive prompts                 |
| `-o`, `--output`  | Output file path                                |
| `-p`, `--port`    | Port number                                     |
| `-q`, `--quiet`   | Suppress non-essential output                   |
| `-u`, `--user`    | User specification                              |
| `--version`       | Version information                             |
| `-v`              | Typically version; avoid ambiguity with verbose |

**Choose sensible defaults.** Flags should override defaults, not enable baseline functionality.

**Prompt for missing arguments interactively** when stdin is a TTY. But never _require_ prompts — every value must be settable via flag or argument. Skip prompts in non-interactive environments.

**Confirm destructive operations.** Scale confirmation difficulty to severity:

- _Mild_ (small local change): Optional confirmation, or just do it.
- _Moderate_ (major local/remote changes): Usually prompt. Consider showing a dry-run preview first.
- _Severe_ (complex/irreversible deletion): Require typing the resource name, or a dedicated flag.

**Support `-` for stdin/stdout.** Enables pipeline composition without temporary files.

**Make flag/argument/subcommand order independent.** Don't fail because the user wrote `mycmd subcmd --foo=1` instead of `mycmd --foo=1 subcmd`.

**Never accept secrets via flags.** Flags are visible in `ps` output and shell history. Use `--password-file`, stdin, or a credential manager instead.

---

## Interactivity

**Only prompt when stdin is a TTY.** Detect whether you're in an interactive session before asking questions.

**Provide `--no-input`.** Disables all prompts; fail with guidance on which flags to provide.

**Disable echo for password input.**

**Ensure Ctrl-C always works.** The user must always be able to interrupt.

---

## Subcommands

**Enforce consistency across subcommands.** Identical flag names should mean the same thing. Output formatting should be uniform. Configuration should be shared.

**Use consistent noun/verb ordering.** For two-level subcommands, pick a pattern and stick with it.

**Avoid confusable names.** Don't have both "update" and "upgrade" — users will mix them up.

---

## Robustness

**Validate input early.** Check before acting. Bail before corrupting state.

**Print something within 100ms.** Users perceive delays beyond 100ms. Show a spinner or status message for longer startup. Always indicate before making network requests.

**Show progress for long operations.** Spinners for indeterminate waits. Progress bars for measurable progress. Animate to reassure users that the program hasn't hung.

**Parallelize thoughtfully.** Support multiple progress bars. Ensure output from parallel tasks doesn't interleave destructively. Print logs on error even if hidden during success.

**Set network timeouts.** Use reasonable defaults.

**Design for recoverability.** Idempotent operations. Resume capability where possible. Users should be able to hit up-arrow and re-run after a failure.

**Prefer crash-only design.** Defer cleanup to the next run. Exit immediately on failure rather than attempting fragile recovery.

**Anticipate misuse.** Your CLI will be wrapped in scripts, run on bad connections, executed concurrently, and used in unexpected environments.

---

## Future-proofing

**Make additive changes.** Add new flags/subcommands instead of changing existing behavior.

**Warn about deprecations.** Tell users what's changing, when, and how to migrate.

**Human-readable output can change freely.** Scripts should use `--plain` or `--json` for stable output.

**Don't create catch-all subcommands.** Avoid implicit defaults (e.g., `mycmd echo` meaning `mycmd run echo`). This blocks future command additions.

**Don't expand abbreviations.** Don't let `i` match `install`. Future commands will create ambiguity.

**Build for 20-year stability.** Minimize external dependencies.

---

## Signals and Control

**Handle Ctrl-C gracefully.** Print any relevant output, then exit. If cleanup is needed, implement it with a timeout.

**Support double Ctrl-C.** First press triggers graceful shutdown. Second press skips cleanup and exits immediately:

```
^CGracefully stopping... (press Ctrl+C again to force)
```

**Tolerate incomplete previous runs.** Don't assume the previous execution finished cleanly.

---

## Configuration

Three categories with appropriate mechanisms:

1. **Per-invocation variations** (debug, dry-run, output format) → **flags**. Optionally environment variables.
2. **Machine-specific, project-variable settings** (cache paths, proxy, color) → **flags, env vars, or `.env` files**.
3. **Project-stable, version-controlled settings** (build config, linter rules) → **dedicated config files**.

**Follow the XDG Base Directory Specification.** Use `~/.config/<appname>/` instead of littering `$HOME` with dotfiles.

**Ask before modifying user config.** Describe exactly what you'll add. Prefer creating new files over appending. Use dated comments.

**Configuration precedence** (highest to lowest):

1. Flags
2. Environment variables
3. Project-level config (`.env`, project config files)
4. User-level config (`~/.config/`)
5. System-wide config (`/etc/`)

---

## Environment Variables

**Use environment variables for contextual variation.** Values that change per session, invocation, or project.

**Naming rules:** uppercase, underscores, no leading numbers. `MY_APP_DEBUG` is valid. `2FAST` is not.

**Keep values single-line.**

**Standard variables to respect:**

| Variable | Purpose |
| --- | --- |
| `NO_COLOR` | Disable color output |
| `FORCE_COLOR` | Force color output |
| `DEBUG` | Enable verbose/debug output |
| `EDITOR` | Preferred editor for multi-line input |
| `HTTP_PROXY`, `HTTPS_PROXY`, `ALL_PROXY`, `NO_PROXY` | Network proxy config |
| `SHELL` | User's shell |
| `TERM`, `TERMINFO`, `TERMCAP` | Terminal capabilities |
| `TMPDIR` | Temporary file location |
| `HOME` | Home directory |
| `PAGER` | Preferred pager |
| `LINES`, `COLUMNS` | Terminal dimensions |

**Read `.env` files for project-specific config.** But use dedicated config files when settings get complex.

**Never read secrets from environment variables.** They leak through child processes, `ps`, Docker inspect, systemd, and shell history. Use credential files, pipes, unix sockets, or secret management services.

---

## Naming

**Choose simple, memorable names.** Avoid generic terms that create namespace conflicts.

**Lowercase with dashes.** `my-tool`, not `MyTool` or `my_tool`.

**Balance brevity with clarity.** Reserve very short names for universal utilities.

**Optimize for comfortable typing.** Consider hand mechanics and keyboard flow.

---

## Distribution

**Distribute a single binary when possible.** If not feasible, use platform package managers.

**Language-specific tools can assume the relevant runtime.**

**Provide uninstall instructions** at the bottom of the installation guide.

---

## Analytics

**Never phone home without explicit consent.** Opt-in for everything. Be transparent about collection, anonymization, and retention.

**Consider alternatives:** instrument web docs, track download counts, solicit feedback through the issue tracker.

---

## Further Reading

- _The Unix Programming Environment_ — Kernighan and Pike
- POSIX Utility Conventions
- GNU Coding Standards: Program Behavior for All Programs
- 12 Factor CLI Apps — Jeff Dickey
- CLI Style Guide — Heroku
- _The Design of Everyday Things_ — Don Norman
- no-color.org
- The Poetics of CLI Command Names — Smallstep
- Crash-only software: More than meets the eye — LWN
- Writing Helpful Error Messages — Google
- Error-Message Guidelines — Nielsen Norman Group
- XDG Base Directory Specification — freedesktop.org
