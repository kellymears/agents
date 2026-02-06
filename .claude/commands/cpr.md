---
description:
  Commit, push, and open a pull request with conventional commit formatting
allowed-tools: [Bash, Read, Glob, Grep, AskUserQuestion]
---

# Commit, Push, and Create Pull Request

Execute a complete git workflow: commit staged/unstaged changes, push to remote,
and open a pull request.

## Workflow

1. Check current branch with `git branch --show-current`
2. If on `main` or `master`:
   - Use AskUserQuestion to ask user if they want to: a) Push directly to
     main/master (requires explicit confirmation) b) Create a new branch (ask
     for branch name)
   - If creating new branch: `git checkout -b <branch-name>`

3. Run in parallel:
   - `git status` to see all changes
   - `git diff` to see unstaged changes
   - `git diff --cached` to see staged changes
   - `git log -5 --oneline` to see recent commit style

4. Analyze changes and determine:
   - Commit type: feat|fix|docs|style|refactor|test|chore
   - Scope (optional): affected area/component
   - Description: concise summary of changes

5. Stage changes: `git add <specific-files>` (prefer specific files over
   `git add .`)

6. Commit with conventional format:

   ```
   git commit -m "$(cat <<'EOF'
   type(scope): description

   Co-Authored-By: Claude <noreply@anthropic.com>
   EOF
   )"
   ```

7. Push to remote: `git push -u origin <branch>`

8. Create PR with `gh pr create`:

   ```
   gh pr create --title "type(scope): description" --body "$(cat <<'EOF'
   ## Summary
   Brief description of what this PR does.

   ## Changes
   - Change 1
   - Change 2
   - Change 3

   🤖 Generated with Claude Code
   EOF
   )"
   ```

9. Return the PR URL to the user

## Important Notes

- Never force push or use destructive git commands
- Never skip pre-commit hooks (no --no-verify)
- If commit fails due to hooks, fix issues and create a NEW commit (don't amend)
- Don't commit sensitive files (.env, credentials, etc.)
