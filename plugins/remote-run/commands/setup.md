---
description: Guided first-time setup for remote-run — configure a remote host, verify SSH, and prove end-to-end execution
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, AskUserQuestion
---

Walk the user from nothing to a working, verified remote-run host. The
objective is not "config file written" — it is **the agent ran a real command
on the remote box and the user confirmed the result is satisfactory**. Do not
declare setup complete before that.

Read the `remote-run` skill (SKILL.md in this plugin) first — setup writes the
config and memory files that skill consumes, and the end-to-end test in Step 6
must follow the skill's own workflow.

## Step 0: Check existing state

```bash
ls ~/.claude/remote-run/config.json ~/.claude/remote-run/memory/ 2>/dev/null
```

- **Config exists**: read it, summarize the configured hosts, and use
  AskUserQuestion — add a new host, reconfigure/repair an existing one, or
  just re-run verification (jump to Step 6). Never silently overwrite an
  existing host entry.
- **No config**: continue to Step 1.

Also confirm local prerequisites: `command -v ssh rsync` — both should exist.
If `rsync` is missing, note that dirty-tree sync will fall back to `scp` and
continue.

## Step 1: Gather host details

Use AskUserQuestion (the user can always answer "Other" with free text):

1. **SSH target** — "How do you reach the box? An alias from ~/.ssh/config
   (e.g. `mybox`) or `user@host` / `user@ip`." If they give a raw IP with no
   alias, offer to write a proper `Host` block into `~/.ssh/config` in Step 2
   — aliases survive IP changes and keep the config readable.
2. **Fallback route** — "Is there a second way to reach it when the primary
   fails — a VPN/Tailscale hostname, a different IP?" (optional, can be none)
3. **Where code lives** — "Where do projects live on the box (e.g.
   `~/code`)? And where do they live on this machine?" This becomes
   `path_map`.

Ask what the box is for in one open question ("What kind of work should land
on this machine? Anything I should never do on it?") — the answer seeds
`notes`.

## Step 2: Establish headless SSH

Headless means this must succeed with no prompt of any kind:

```bash
ssh -o BatchMode=yes -o ConnectTimeout=5 <target> true && echo OK
```

If it fails, diagnose in this order, fix, and re-test after each fix:

1. **Alias unknown** (`Could not resolve hostname`): if the user gave a raw
   `user@ip`, write a `Host` block to `~/.ssh/config` (append, never
   overwrite; create with `chmod 600` if absent):
   ```
   Host <alias>
     HostName <ip>
     User <user>
   ```
2. **Host key unverified**: run once with
   `-o StrictHostKeyChecking=accept-new` to pin the key, then re-test in
   BatchMode.
3. **No key auth** (`Permission denied (publickey,password)`): check for a
   local key (`ls ~/.ssh/id_*.pub`); generate one if none
   (`ssh-keygen -t ed25519 -N "" -f ~/.ssh/id_ed25519`). Installing it needs
   the user's password, which BatchMode forbids — ask the **user** to run
   `ssh-copy-id <target>` themselves (in Claude Code they can type
   `! ssh-copy-id <target>` to run it in-session). Re-test after.
4. **Network unreachable / timeout**: try the fallback target the same way.
   If only the fallback works, ask whether the primary needs a VPN up
   (Tailscale, WireGuard) and record that in `notes`.

Loop until BatchMode succeeds on at least one target. Record which targets
work and any fix that was needed — these become `notes` and memory entries.

## Step 3: Probe the box

One batched call, so facts come from the machine rather than assumptions:

```bash
ssh -T <target> '
  uname -sm; cat /etc/os-release 2>/dev/null | head -2
  nproc 2>/dev/null || sysctl -n hw.ncpu
  free -h 2>/dev/null | head -2 || sysctl -n hw.memsize
  for t in git rsync tmux docker node python3 gh; do command -v $t >/dev/null && echo "have:$t"; done
  git ls-remote https://github.com/git/git.git HEAD >/dev/null 2>&1 && echo "git:network-ok"
  ssh -o BatchMode=yes -T git@github.com 2>&1 | head -1
'
```

From the output determine: OS and package manager, core count (for `-j`
flags), RAM, available tooling, and whether the box has its own GitHub auth
(clean `Hi <user>!` from the last line) or clones must happen via rsync from
the local machine. Summarize the findings to the user in two or three plain
sentences.

## Step 4: Verify the path map

```bash
ssh -T <target> 'ls -d <remote-code-root> 2>/dev/null && ls <remote-code-root> | head'
```

If the directory doesn't exist, offer to create it. If the layout differs
from what the user said (e.g. repos nest one level deeper), show what you
found and adjust `path_map` with their confirmation.

## Step 5: Write config and seed memory

Write `~/.claude/remote-run/config.json` following the schema in SKILL.md —
merge into the existing file if one exists; set `default_host` only if unset
or the user asks. Fill `os` and `notes` from Steps 1–4, not from guesses.

Seed `~/.claude/remote-run/memory/<host>.md`:

```markdown
# <host>

## Facts (probed <date>)
- <OS, CPU/RAM, package manager>
- <tooling present/absent, git auth status>

## Learnings
- <date>: <anything non-obvious from setup — fixes applied in Step 2,
  layout surprises from Step 4>
```

## Step 6: End-to-end verification — the actual objective

Prove the loop works on something real. Use AskUserQuestion to pick the test:

- **Recommended**: sync the current project to the box and run its check
  (test suite, build, lint — whatever the project has).
- **Quick**: run a compute probe (e.g. `nproc`-wide compile or a checksum
  over a synced tree) to show sync + execution + output capture.
- **User's choice**: they name the command.

Execute it exactly as the `remote-run` skill prescribes: sync per the
skill's strategy, run with `ssh -T` (detached with a log if long), show the
user the output and where it ran.

Then ask: **"That ran on `<host>`. Is the result what you expected?"**

- **Yes** → setup is complete. Go to Step 7.
- **No** → debug it now: read the job log, compare against a local run if
  needed, fix (wrong path map, missing runtime on the box, env differences),
  append what you learned to the memory file, and re-run. Repeat until the
  user confirms or tells you to stop. Do not end the command with a broken
  verification and a shrug.

## Step 7: Wrap up

- Append any remaining durable learnings from Steps 2–6 to the memory file.
- Tell the user, in plain terms: which host is configured, how to trigger
  the skill ("run X on <host>", "run this remotely"), where the config and
  memory files live, and that they can re-run `/remote-run:setup` to add
  another host or repair this one.
