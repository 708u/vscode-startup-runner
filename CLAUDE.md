# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VS Code extension that automatically runs commands from trigger files when a workspace opens. It features a security model with hash-based approval and webview-based review UI.

## Commands

```bash
# Build
pnpm run compile        # Type check + lint + esbuild
pnpm run package        # Production build

# Development
pnpm run watch          # Watch mode (esbuild + tsc)

# Lint
pnpm run lint           # ESLint on src/
pnpm run check-types    # TypeScript type check only

# Test
pnpm run test           # Full test (compile-tests + compile + lint + vscode-test)
pnpm run compile-tests  # Compile tests to out/

# Package
pnpm run pack           # Generate .vsix file
```

## Local Install

```bash
pnpm run pack
# Then in VS Code: Cmd+Shift+P → "Extensions: Install from VSIX..."
```

## Release

```bash
git checkout -b release/v0.0.2
pnpm run bump:patch  # or bump:minor, bump:major
git add -A && git commit -m "chore: bump version"
gh pr create --fill
# Merge PR → CI creates tag and publishes to Marketplace
```

## Architecture

Single-file extension (`src/extension.ts`) with these key components:

- **Activation**: Triggered on `onStartupFinished`, reads tasks from `startupRunner.tasks` configuration
- **Hash-based approval**: SHA256 hashes stored in `globalState` to remember approved file contents
- **Webview approval dialog**: Shows file content for review with Allow/Once/Deny options
- **Terminal execution**: Each task runs in its own terminal named `Startup Runner: {taskName} ({hash})`
- **Deduplication**: Tasks with identical `name` and `file` are filtered (first occurrence wins)

Key flow:

1. Extension activates after VS Code startup
2. Finds enabled tasks, filters duplicates, and checks for trigger files in workspace roots
3. For each file: check saved hash -> if changed/new, show approval webview
4. Execute approved files in isolated terminals

## Documentation

When changing implementation, check `docs/DEVELOPMENT.md` for consistency:

- Contradiction: Documentation does not match actual implementation
- Missing: New features or changes not reflected in documentation
- Stale: Removed features still documented

Update documentation when any of these issues are found.
