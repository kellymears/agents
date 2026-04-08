---
name: version
description: >
  Bump plugin versions in this repo's .claude-plugin/marketplace.json after making changes. Detects which plugins were modified, determines the appropriate semver bump (major, minor, or patch) from commit history, and updates the manifest. Use when the user wants to bump versions, update plugin versions, or says "version bump". Also trigger when the user says "bump changed plugins", "update versions", "bump versions", or anything about versioning plugins after making changes — even just "version" or "bump".
---

# Plugin Version Bumper

Bump plugin versions in this repo's `.claude-plugin/marketplace.json` based on what changed and why.

This skill is scoped to the `kellymears/agents` repo. The manifest has a top-level `version` field for the registry itself, plus individual `version` fields for each plugin under `plugins/`.

**Manifest version** — bump when the registry changes (new plugin added = minor, plugin removed or schema change = major, metadata tweaks = patch).

**Plugin versions** — bump based on commits to each plugin's source directory.

## Versioning Rules

| Bump | When | Example |
| --- | --- | --- |
| `patch` | Bug fixes, typo corrections, small adjustments | `1.0.0 → 1.0.1` |
| `minor` | New skills, new features, non-breaking enhancements | `1.0.1 → 1.1.0` |
| `major` | Breaking changes — renamed skills, removed features, restructured plugin | `1.1.0 → 2.0.0` |

When in doubt, lean toward `patch`. The user can always override.

## Workflow

### 1. Detect Changes

Read `.claude-plugin/marketplace.json` to get the plugin list and current versions. Then determine which plugins have changes not yet reflected in their version.

Find the last commit that touched the manifest's version fields:

```bash
git log --oneline -1 -- .claude-plugin/marketplace.json
```

For each plugin, check for commits to its source directory since that version commit:

```bash
git log --oneline <last-version-commit>..HEAD -- plugins/<name>
```

Also check for uncommitted changes with `git diff --stat` and `git diff --cached --stat`, mapping changed files to plugins by path.

If the user specifies which plugins to bump, skip detection and focus on those.

### 2. Analyze Commit Types

For each changed plugin, read the commit messages to determine the bump level:

- Commits starting with `fix`, `style`, `docs`, `chore`, `perf` → **patch**
- Commits starting with `feat` → **minor**
- Commits containing `BREAKING CHANGE` or `!:` → **major**

The highest-level change wins. A plugin with both `fix` and `feat` commits gets a `minor` bump.

If the user specifies a bump level (e.g., "minor bump the git plugin"), use that instead.

### 3. Present the Plan

Show the user what you intend to do before making any changes:

```
Plugin version bumps:

  git:         1.0.1 → 1.0.2 (patch)
    - fix(git): correct skill directory and name field namespacing

  screenshot:  1.0.0 → 1.1.0 (minor)
    - feat(screenshot): add R2 upload retry logic
    - fix(screenshot): handle missing Chrome binary
```

Include the relevant commits so the user can verify the bump level makes sense.

**Wait for the user to confirm before proceeding.** They may want to adjust bump levels or skip certain plugins.

### 4. Apply the Bumps

Update the version in **both** locations for each bumped plugin:

1. `.claude-plugin/marketplace.json` — the registry-level manifest
2. `plugins/<name>/.claude-plugin/plugin.json` — the plugin's own manifest

Both files use 2-space indentation. Read each file, update its `version` field, and write it back. These two files must always agree — that's the whole point of this step.

### 5. Report

After updating, show what changed:

```
Updated versions:

  git:         1.0.1 → 1.0.2
    ✓ .claude-plugin/marketplace.json
    ✓ plugins/git/.claude-plugin/plugin.json

  screenshot:  1.0.0 → 1.1.0
    ✓ .claude-plugin/marketplace.json
    ✓ plugins/screenshot/.claude-plugin/plugin.json
```

Don't commit automatically — let the user decide when to commit.

## Edge Cases

- **No changes detected**: Tell the user all plugin versions are up to date. If they disagree, ask which plugin to bump and by how much.
- **New plugin not in manifest**: Flag it — the user needs to add the plugin entry to marketplace.json first.
- **Multiple bump-worthy changes in one plugin**: Use the highest bump level across all changes.
- **User says "bump all"**: Bump every plugin that has any changes, even if it's just a chore commit.
