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
```

## Architecture

Single-file extension (`src/extension.ts`) with these key components:

- **Activation**: Triggered on `onStartupFinished`, reads tasks from `startupRunner.tasks` configuration
- **Hash-based approval**: SHA256 hashes stored in `globalState` to remember approved file contents
- **Webview approval dialog**: Shows file content for review with Allow/Once/Deny options
- **Terminal execution**: Approved scripts run via `bash "{filePath}"` in a dedicated terminal

Key flow:

1. Extension activates after VS Code startup
2. Finds enabled tasks and checks for trigger files in workspace roots
3. For each file: check saved hash -> if changed/new, show approval webview
4. Execute approved files in terminal
