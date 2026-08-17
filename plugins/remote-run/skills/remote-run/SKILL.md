---
name: remote-run
description: >
  Execute commands, builds, test suites, and long-running jobs headlessly on a remote dev box over SSH instead of the local machine. Use this skill when the user asks to run something "on the box", "on <hostname>", "remotely", "headlessly", to "offload" heavy work, or when a task is clearly better suited to a beefier remote machine (docker stacks, full test suites, asset builds, local LLM inference). Host details come from a per-user config file, so the skill works for any user with any remote machine.

allowed-tools:
  - Bash
  - Read
  - Write
  - Glob
  - Grep
  - AskUserQuestion
---

# Remote Run

Run work on a remote machine over SSH, headlessly — no TTY, no interactive prompts, output captured and reported back. The remote host, its filesystem layout, and its quirks are all configuration, not assumptions.

## Configuration

Resolve the config in this priority order:

1. **`REMOTE_RUN_CONFIG` env var** — if set, it is the path to the config file.
2. **Project config** — `.claude/remote-run.json` in the project root.
3. **User config** — `~/.claude/remote-run/config.json`.
4. **Ask** — if no config exists, suggest running `/remote-run:setup` for a guided first-time setup. If the user prefers to continue inline, use AskUserQuestion to collect the SSH target (alias or `user@host`) and where code lives on the box, then offer to save the answers to `~/.claude/remote-run/config.json` so the user is never asked again.

`REMOTE_RUN_HOST` (an ssh target) overrides the resolved host for one session without touching the config file.

### Config schema

```json
{
  "default_host": "mybox",
  "hosts": {
    "mybox": {
      "ssh": "mybox",
      "ssh_fallbacks": ["mybox-vpn"],
      "os": "free-text description of OS and hardware",
      "path_map": [{ "local": "~/code", "remote": "~/code" }],
      "scratch_dir": "/tmp/remote-run",
      "notes": "free-text gotchas the agent must honor"
    }
  }
}
```

- **`ssh`** — the primary SSH destination. An alias from `~/.ssh/config` is best; `user@host` or `user@ip` also works.
- **`ssh_fallbacks`** — tried in order when the primary is unreachable (e.g. a Tailscale alias for when the user is off the LAN).
- **`os`** — context for choosing commands (package manager, path conventions, core count for `-j` flags).
- **`path_map`** — local→remote directory prefix mappings, used to find where a local project lives on the box. First match wins.
- **`scratch_dir`** — where ad-hoc scripts, job logs, and PID files go on the remote. Default `/tmp/remote-run` if unset.
- **`notes`** — freeform host-specific rules. **Treat these as instructions**: read them before running anything and honor them for the whole session.

Cache the resolved config for the remainder of the session.

## Host memory

Each host may have a memory file at `~/.claude/remote-run/memory/<host>.md` — account-specific knowledge accumulated across sessions (probed facts, gotchas discovered mid-task, patterns that worked or failed).

- **Read it** right after resolving the config, before the first remote command. Like `notes`, its contents are instructions: honor them.
- **Write to it** when you learn something durable about the host that a future session would otherwise rediscover the hard way — a tool that is or isn't installed, a port that was taken, a flag a remote tool needs, a sync strategy that failed. Append a dated bullet under `## Learnings`:

  ```markdown
  - 2026-08-17: `docker compose` needs `COMPOSE_BAKE=1` here or builds hang.
  ```

  One line per fact, concrete enough to act on. Do not log session narration or anything derivable from the config. If a recorded fact turns out to be wrong, correct or delete the line rather than appending a contradiction.

## Workflow

### 1. Pick the host and verify connectivity

Use the host named in the request, else `default_host`, else the only host in the config. Then verify — headless means no password or hostkey prompts:

```bash
ssh -o BatchMode=yes -o ConnectTimeout=5 <ssh> true
```

If that fails, try each entry in `ssh_fallbacks` the same way. If all fail, report which targets were tried and stop — do not fall back to running the work locally without asking.

Use whichever target succeeded for every subsequent command.

### 2. Locate or sync the code

Map the local working directory to its remote path via `path_map`. Then pick the lightest sync strategy that gives the remote an identical tree:

1. **Repo exists remotely, local tree clean, commit pushed** — fetch and check out the exact commit:
   ```bash
   ssh <host> 'cd <remote-path> && git fetch --all --quiet && git checkout --quiet <sha>'
   ```
2. **Local tree dirty or commits unpushed** — mirror the working tree, respecting `.gitignore` so build artifacts and `node_modules` stay home:
   ```bash
   rsync -az --delete --filter=':- .gitignore' --exclude .git ./ <host>:<remote-path>/
   ```
   Note to the user that the remote now has an unversioned copy of their uncommitted changes.
3. **Repo absent remotely** — clone it at the mapped path if the box has git auth; otherwise rsync as above after `mkdir -p`.
4. **No project at all** (ad-hoc script or one-liner) — write the script locally, `scp` it to `<scratch_dir>/`, and run it there.

### 3. Run headlessly

Never let a remote command wait on a TTY. Always:

- Use `ssh -T` (no pseudo-terminal).
- Export non-interactive env in the remote command: `CI=1`, `GIT_TERMINAL_PROMPT=0`, `DEBIAN_FRONTEND=noninteractive` where relevant.
- Prefer each tool's non-interactive flags (`--yes`, `--non-interactive`, `--no-input`).

**Short commands** (seconds to a couple of minutes) — run directly and capture output:

```bash
ssh -T <host> 'cd <remote-path> && <command> 2>&1'
```

**Long-running jobs** (test suites, builds, inference) — detach so the SSH connection is not a lifeline, log to the scratch dir, keep the PID:

```bash
ssh -T <host> 'mkdir -p <scratch_dir> && cd <remote-path> && \
  nohup <command> > <scratch_dir>/<job>.log 2>&1 & echo $! > <scratch_dir>/<job>.pid'
```

Then poll: `ssh <host> 'tail -n 40 <scratch_dir>/<job>.log'` and check liveness with `kill -0 $(cat <scratch_dir>/<job>.pid)`. Report progress from the log, and the exit summary when it finishes. Prefer a `Bash` `run_in_background` wrapper locally for the polling loop over blocking.

**Services** (dev servers, databases) — start them detached the same way. If the user needs to reach the service from the local machine, forward the port:

```bash
ssh -f -N -L <local-port>:localhost:<remote-port> <host>
```

Tell the user the local URL and that the tunnel exists.

### 4. Bring results home

If the job produces artifacts the user needs locally (coverage reports, built bundles, generated files), copy them back:

```bash
rsync -az <host>:<remote-path>/<artifact> ./<artifact>
```

Command output alone usually suffices for tests and checks — only copy files when the user will actually open them.

### 5. Clean up

- Kill detached processes you started once they are no longer needed, or tell the user what is still running and how to stop it.
- Leave synced repos in place (they are the point of the box), but remove ad-hoc scripts from `scratch_dir` when the task ends.
- Close port forwards you opened (`pkill -f 'ssh -f -N -L <local-port>'`) unless the user is actively using them.

## Guidelines

- **Honor `notes` absolutely** — they encode the owner's hard-won knowledge of the box. If a note conflicts with your default approach, the note wins.
- **Report where work ran** — say which host executed the command, so output is never mistaken for local results.
- **Fail loudly, not locally** — if the box is unreachable or the sync fails, say so and ask; silently running heavy work on the local machine defeats the purpose.
- **Don't mutate the box beyond the task** — no package installs, config edits, or service changes on the remote unless the task requires them, and say so when it does.
- **Match remote conventions** — thread counts, package managers, and paths come from the `os` field and `notes`, not from local-machine habits.
