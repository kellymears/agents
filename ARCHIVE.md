# Archive of Removed Content

This file preserves useful information from files and directories that were
removed during repository cleanup on 2026-02-06.

---

## Removed: IDEATION.md

**Reason for removal**: Planning document with proposed features that were never
implemented.

### Preserved Ideas Worth Revisiting

#### Proposed Skills (Context Blocks)

The IDEATION.md outlined composable "skills" that could be loaded contextually:

1. **Code Quality**: `code-review.md`, `refactoring.md`, `testing.md`
2. **Frameworks**: `react.md`, `typescript.md`, `tailwind.md`, `wordpress.md`,
   `php.md`
3. **Workflows**: `git-workflow.md`, `documentation.md`, `debugging.md`
4. **Domain Knowledge**: `api-design.md`, `database.md`, `security.md`

#### Proposed Agents

| Agent           | Purpose                                                                   |
| --------------- | ------------------------------------------------------------------------- |
| `reviewer.md`   | Code review with prioritized feedback (Must Fix/Should Fix/Consider/Nice) |
| `documenter.md` | Documentation writer focused on examples                                  |
| `refactorer.md` | Safe, test-driven refactoring                                             |
| `tester.md`     | Test generation with adversarial thinking                                 |
| `architect.md`  | System design with trade-off analysis                                     |
| `migrator.md`   | Safe migration planning with rollback strategies                          |

#### Proposed Commands

| Command     | Purpose                                 |
| ----------- | --------------------------------------- |
| `/review`   | Comprehensive code review               |
| `/test`     | Generate tests for specified code       |
| `/refactor` | Safe refactoring with test verification |
| `/explain`  | Code explanation at multiple levels     |
| `/migrate`  | Migration planning                      |
| `/deps`     | Dependency analysis                     |

---

## Removed: TOOLING.md

**Reason for removal**: Documents tooling that is self-evident from config
files.

### Key Information Preserved

```bash
# Quick reference
npm run lint          # Run ESLint
npm run lint:fix      # Run ESLint with auto-fix
npm run format        # Format with Prettier
npm run format:check  # Check formatting
npm run typecheck     # TypeScript type checking
npm run check         # All checks
```

| Tool         | Config File        |
| ------------ | ------------------ |
| TypeScript   | `tsconfig.json`    |
| ESLint v9    | `eslint.config.js` |
| Prettier     | `.prettierrc`      |
| EditorConfig | `.editorconfig`    |

---

## Removed: teams/ Directory

**Reason for removal**: Claude Code does not support multi-agent orchestration.
Teams cannot be built with the current toolset.

### Original Concept (Not Currently Possible)

The teams/ directory was intended for multi-agent workflows where multiple
specialized agents would collaborate:

- **Code Review Team**: reviewer + tester + architect
- **Feature Development Team**: architect + implementer + tester + documenter
- **Refactoring Team**: refactorer + tester + reviewer
- **Documentation Team**: documenter + architect + reviewer

**Note**: If Anthropic adds multi-agent support to Claude Code in the future,
these concepts could be revisited.

---

## Removed: agents/\_index.md (Placeholder)

**Reason for removal**: Directory contained only a placeholder with no actual
agent configurations.

### What Would Go Here (Real-World Examples)

1. **agents/reviewer.md**

   ```markdown
   # Code Reviewer

   You are a senior code reviewer. Structure feedback as Must Fix, Should Fix,
   and Consider. Focus on: correctness, security, performance, maintainability,
   test coverage.
   ```

2. **agents/documenter.md**

   ```markdown
   # Documentation Writer

   You write clear, example-driven documentation. Prefer updating existing docs
   over creating new files.
   ```

3. **agents/refactorer.md**
   ```markdown
   # Refactoring Specialist

   You improve code structure without changing behavior. Never refactor without
   tests.
   ```

---

## Removed: docs/\_index.md (Placeholder)

**Reason for removal**: Directory contained only a placeholder with no actual
documentation.

### What Would Go Here (Real-World Examples)

1. **docs/patterns.md** - Discovered patterns and anti-patterns from using
   Claude Code
2. **docs/troubleshooting.md** - Common issues and solutions
3. **docs/workflows.md** - Effective workflows for different tasks

---

## Removed: skills/\_index.md and skills/blocks/\_index.md (Placeholders)

**Reason for removal**: Directories contained only placeholders with no actual
skill definitions.

### What Would Go Here (Real-World Examples)

1. **skills/blocks/typescript.md**

   ```markdown
   # TypeScript Conventions

   - Prefer type inference where obvious
   - Use `unknown` over `any`
   - Discriminated unions for state machines
   - Branded types for domain modeling
   ```

2. **skills/blocks/react.md**

   ```markdown
   # React Patterns

   - Server vs client component decisions
   - Custom hook design principles
   - Performance: memo, useMemo, useCallback guidelines
   ```

3. **skills/blocks/git-workflow.md**
   ```markdown
   # Git Workflow

   - Conventional commits format
   - Branch naming: feature/, fix/, chore/
   - Prefer rebase for clean history
   ```

---

## Removed: templates/\_index.md (Placeholder)

**Reason for removal**: Directory contained only a placeholder with no actual
templates.

### What Would Go Here (Real-World Examples)

1. **templates/command.md** - Template for creating new slash commands
2. **templates/skill-block.md** - Template for creating new context blocks
3. **templates/agent.md** - Template for creating new agent configurations

---

## Summary of Cleanup

| Item                     | Type         | Reason                                   |
| ------------------------ | ------------ | ---------------------------------------- |
| IDEATION.md              | Planning doc | Never implemented, ideas preserved above |
| TOOLING.md               | Planning doc | Self-evident from config files           |
| teams/                   | Directory    | Feature not supported by Claude Code     |
| agents/\_index.md        | Placeholder  | No real content                          |
| docs/\_index.md          | Placeholder  | No real content                          |
| skills/\_index.md        | Placeholder  | No real content                          |
| skills/blocks/\_index.md | Placeholder  | No real content                          |
| templates/\_index.md     | Placeholder  | No real content                          |

The repository now contains only:

- Actual working commands (`.claude/commands/`)
- Active configuration (`.claude/settings.local.json`)
- Working documentation site (`site/`)
- Essential project files (CLAUDE.md, README.md, config files)
