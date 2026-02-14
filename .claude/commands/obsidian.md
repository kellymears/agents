---
description: Create a document in an Obsidian vault. Supports all vaults synced via iCloud.
tools:
  - Write
  - Read
  - Glob
  - Grep
  - Bash
  - AskUserQuestion
---

# Create Obsidian Document

Write a well-formatted markdown note to an Obsidian vault.

## Obsidian Vault Root

```
~/Library/Mobile Documents/iCloud~md~obsidian/Documents/
```

## Available Vaults

| Vault       | Purpose                          |
| ----------- | -------------------------------- |
| Journal     | Daily notes, guides, logs        |
| Development | Dev tooling, workflow, reference |
| oncarrot    | Carrot project notes             |
| Personal    | Personal notes                   |
| Inventory   | Asset tracking                   |
| bud         | bud.js project notes             |

## Workflow

1. Parse the user's request for:
   - **Topic/title** — what the note is about
   - **Target vault** — which vault to write to
   - **Subfolder** — optional path within the vault (e.g., `guides/`, `2026/02/`)
   - **Content direction** — what the note should cover

2. If the vault or topic is ambiguous, use AskUserQuestion to clarify:
   - Which vault (default: Journal)
   - Any subfolder structure preference
   - Scope of content

3. Check the target vault for existing structure:

   ```bash
   ls "<vault-path>/"
   ```

   Respect existing folder conventions. If the vault uses dated folders, date-prefixed filenames, or topic folders — follow suit.

4. Check for an existing note with the same or similar name to avoid duplicates:

   ```bash
   find "<vault-path>" -iname "*<keyword>*" -name "*.md"
   ```

5. Write the note using the Write tool. Path format:
   ```
   ~/Library/Mobile Documents/iCloud~md~obsidian/Documents/<Vault>/<optional-subfolder>/<Title>.md
   ```

## Note Formatting Rules

- Use standard markdown compatible with Obsidian's renderer
- Start with a `# Heading` matching the filename
- Use `## Sections` for logical groupings
- Fenced code blocks with language identifiers
- Pipe tables for structured data
- Use `[[wikilinks]]` for cross-references within the same vault when relevant
- No YAML frontmatter unless the user requests it or the vault has an established frontmatter convention
- No emojis unless the user requests them

## Guidelines

- **Read before writing** — check if a similar note exists; offer to update instead
- **Match vault conventions** — if the vault has a pattern (folders, naming, tags), follow it
- **One idea per note** — prefer focused notes over mega-documents
- **Keep it scannable** — headings, lists, and code over prose walls
- **Confirm on ambiguity** — when unsure about vault, scope, or structure, ask
