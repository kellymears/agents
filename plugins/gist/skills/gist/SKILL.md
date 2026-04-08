---
name: gist
description: >
  Manage GitHub gists — create, list, view, edit, and delete. Use this skill when the user wants to create a gist, share a snippet, save code to a gist, list their gists, view or read a gist, edit/update a gist, or delete one. Also triggers when the user pastes code and asks to "gist this", "share this snippet", or "save this somewhere". Gists are created as **private** (secret) by default — only made public when the user explicitly asks.
---

# Gist Management

Create, list, view, edit, and delete GitHub gists using the `gh` CLI.

## Prerequisites

The `gh` CLI must be installed and authenticated. If a `gh` command fails with an auth error, tell the user to run `gh auth login` and try again.

## Privacy Default

Gists are **private by default**. The `gh` CLI calls these "secret" gists.

- Pass **no visibility flag** (gh defaults to secret) unless the user says "public"
- Only add `--public` when the user explicitly requests a public gist
- If ambiguous, ask — but lean toward private

This matters because public gists are discoverable and indexed by search engines. A private gist is only accessible via its URL.

## Operations

### Create a Gist

```bash
# From one or more files
gh gist create <file1> [file2...] --desc "description"

# Public (only when explicitly requested)
gh gist create <file1> --public --desc "description"
```

**Workflow:**

1. Determine the source content:
   - **Files the user points to** — pass the file paths directly
   - **Code from the conversation** — write to a temp file first, using a meaningful filename with the correct extension (e.g., `/tmp/parser.py`, not `/tmp/gist.txt`). The filename becomes the gist's displayed name.
   - **Clipboard / stdin** — pipe directly: `echo "content" | gh gist create --filename name.ext`

2. Add a description if the user provides one, or infer a short one from context. Descriptions help when listing gists later.

3. After creation, display the gist URL to the user.

### List Gists

```bash
# Your gists (default: 10 most recent)
gh gist list

# More results
gh gist list --limit 30

# Public only / secret only
gh gist list --public
gh gist list --secret
```

Present results in a scannable format — the ID, description, visibility, and file count are the most useful columns.

### View a Gist

```bash
# View gist content
gh gist view <id-or-url>

# View a specific file in a multi-file gist
gh gist view <id-or-url> --filename <name>
```

If the user provides a gist URL, extract the ID or pass the URL directly — `gh` handles both.

### Edit a Gist

```bash
# Update from a local file
gh gist edit <id-or-url> --filename <target-file> <source-file>

# Add a file to an existing gist
gh gist edit <id-or-url> --add <new-file>
```

**Workflow:**

1. If the user wants to change content, write the updated content to a temp file, then use `--filename` to target the specific file in the gist.
2. If adding a new file to a multi-file gist, use `--add`.
3. Confirm the edit by viewing the gist afterward.

### Delete a Gist

```bash
gh gist delete <id-or-url>
```

Deletion is **irreversible**. Always confirm with the user before deleting, even if they asked for it — a quick "Delete gist `abc123` — are you sure?" is enough.

## Tips

- **Multi-file gists**: pass multiple files to `gh gist create` to bundle them into a single gist. Useful for related snippets (e.g., a function and its test).
- **Filename matters**: the filename you use (or pass via `--filename`) determines syntax highlighting on GitHub. Use the right extension.
- **Finding a gist**: if the user says "that gist I made yesterday" or similar, run `gh gist list` and help them identify it by description or date.
- **Forking**: `gh gist fork <id-or-url>` forks someone else's gist to the user's account if they want to modify a gist they don't own.
