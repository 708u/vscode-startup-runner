# Development Guide

This guide describes the architecture and internal specifications of VS Code
Startup Runner.

## Overview

VS Code Startup Runner executes shell scripts automatically when a workspace
opens. The extension implements a security-first design using hash-based content
approval and an interactive webview dialog.

## Architecture

### High-Level Flow

```txt
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  VS Code Start  │────▶│  Read Settings   │────▶│  Discover Tasks │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                          │
                                                          ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ Execute in      │◀────│  Check Approval  │◀────│  Read Files &   │
│ Terminal        │     │  Status          │     │  Compute Hash   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
                               ▼ (if new/changed)
                        ┌──────────────────┐
                        │  Show Approval   │
                        │  Dialog          │
                        └──────────────────┘
```

### Module Structure

```txt
src/
├── extension.ts              # Entry point and activation logic
├── types.ts                  # Core type definitions
├── constants.ts              # Global constants
├── storage/
│   ├── hashStorage.ts        # Content-hash approval storage
│   └── pathApprovalStorage.ts # Path-based approval storage
├── utils/
│   ├── hash.ts               # SHA256 hashing
│   ├── file.ts               # File I/O utilities
│   ├── git.ts                # Git worktree detection
│   ├── glob.ts               # Glob pattern expansion
│   └── html.ts               # HTML escaping
└── webview/
    ├── approvalPanel.ts      # Webview creation and messaging
    ├── highlight.ts          # Syntax highlighting with Prism.js
    ├── icons/                # SVG icon definitions
    ├── styles/               # CSS style modules
    └── templates/            # HTML template components
```

## Core Types

The extension defines these core types in `src/types.ts`:

```typescript
type FilePath = string;
type ContentHash = string;
type ApprovedHashes = Record<FilePath, ContentHash>;

interface Task {
  name: string;      // Task identifier
  file: string;      // Relative path or glob pattern (e.g., "*.sh", "**/*.sh")
  enabled: boolean;  // Enable/disable flag
}

interface PendingExecution {
  taskName: string;
  filePath: FilePath;
  storageKey: FilePath;  // May differ from filePath (worktree handling)
  content: string;
  hash: ContentHash;     // SHA256 of content
}

type ApprovalDecision = "allow" | "allowByPath" | "once" | "deny";
```

## Activation Flow

The extension activates on `onStartupFinished` and follows these steps:

1. **Check workspace trust**: Exit early if the workspace is untrusted
2. **Read configuration**: Get `startupRunner.tasks` from workspace settings
3. **Filter tasks**: Remove disabled tasks and deduplicate by `{name}:{file}`
4. **Resolve files**: Construct absolute paths and read file contents
5. **Check approval**: Compare stored hash with current content hash
6. **Show dialog**: Display approval webview for new or changed files
7. **Execute**: Run approved scripts in dedicated terminals

## Security Model

The extension uses a two-layer approval system to protect users from malicious
scripts.

### Content-Hash Approval

`HashStorage` stores SHA256 hashes of approved file contents. When file content
changes, the extension prompts the user for re-approval.

Storage location: VS Code global state (`startupRunner.approvedHashes`)

### Path-Based Approval

`PathApprovalStorage` stores paths of files trusted regardless of content. This
option suits dynamically generated scripts that change frequently.

Storage location: VS Code global state (`startupRunner.approvedPaths`)

### Approval Decisions

| Decision | Behavior | Storage |
|----------|----------|---------|
| Allow Content | Store content hash, re-ask if changed | Hash storage |
| Allow by Path | Trust path, never re-ask | Path storage |
| Run Once | Execute without saving | None |
| Deny | Skip execution | None |

### Workspace Trust Integration

The extension respects VS Code's workspace trust feature. If the workspace is
untrusted, the extension exits without executing any scripts.

## Worktree Support

The extension detects git worktrees and shares approvals across all worktrees of
the same repository.

### Detection

`getBaseRepoPath()` in `src/utils/git.ts` parses the `.git` file to find the
base repository path.

### Shared Approval

When `startupRunner.worktree.shareApproval` is enabled (default: `true`), the
extension uses the base repository path as the storage key. This shares
approvals across worktrees.

## Webview Approval Dialog

The approval dialog displays file content and collects user decisions.

### Components

- **Header**: File name, path, 8-character hash, line count, status badge
- **Code Section**: Syntax-highlighted content using Prism.js
- **Choices**: Four action buttons with descriptions

### Message Flow

```txt
┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│ Extension      │────▶│ Create Panel   │────▶│ Generate HTML  │
└────────────────┘     └────────────────┘     └────────────────┘
                                                      │
                                                      ▼
┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│ Resolve        │◀────│ Receive        │◀────│ User Clicks    │
│ Promise        │     │ Message        │     │ Button         │
└────────────────┘     └────────────────┘     └────────────────┘
```

### Styling

The dialog uses VS Code CSS variables for theme integration:

- `--vscode-foreground`
- `--vscode-editor-background`
- `--vscode-button-background`

## Configuration

### Task Configuration

Configure tasks in workspace settings (`.vscode/settings.json`):

```json
{
  "startupRunner.tasks": [
    {
      "name": "setup",
      "file": ".startup/setup.sh",
      "enabled": true
    }
  ]
}
```

| Property | Type | Description |
|----------|------|-------------|
| `name` | string | Task identifier displayed in terminal |
| `file` | string | Relative path to the script file |
| `enabled` | boolean | Enable or disable the task |

### Extension Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `startupRunner.tasks` | array | `[]` | List of tasks to execute |
| `startupRunner.worktree.shareApproval` | boolean | `true` | Share approvals across worktrees |

## Commands

### Reset Approved Files

Command ID: `startupRunner.resetApprovedFiles`

Opens a QuickPick dialog listing all approved files. Users can select files to
remove from approval storage. The description shows whether each file uses
content-based or path-based approval.

## Utility Modules

### hash.ts

`getHash(content: string): string`

Computes SHA256 hex digest using Node.js `crypto` module.

### file.ts

`tryReadFile(filePath: string): string | null`

Reads file content with UTF-8 encoding. Returns `null` on any error.

### git.ts

`getBaseRepoPath(workspacePath: string): string | null`

Detects git worktree by parsing `.git` file. Returns base repository path or
`null` if not a worktree.

`resolveToBaseStoragePath(workspacePath: string, relativeFile: string): FilePath`

Returns base repository path if worktree, otherwise returns workspace path.

### html.ts

`escapeHtml(text: string): string`

Escapes `&`, `<`, `>`, `"` characters to prevent XSS in webviews.

### glob.ts

`isGlobPattern(pattern: string): boolean`

Checks if a string contains glob special characters (`*`, `?`, `[`, `{`).

`expandGlobPattern(workspaceFolder, pattern): Promise<string[]>`

Expands a glob pattern to absolute file paths using VS Code's `findFiles` API.
Returns sorted paths. For non-glob patterns, returns single-element array with
the absolute path.

`getRelativePath(workspacePath: string, absolutePath: string): string`

Converts an absolute path to a path relative to the workspace.

## Build System

### Scripts

| Script | Description |
|--------|-------------|
| `pnpm run compile` | Type check, lint, and build |
| `pnpm run watch` | Development watch mode |
| `pnpm run test` | Run full test suite |
| `pnpm run package` | Production build |
| `pnpm run pack` | Generate .vsix file |

### Output

The build process produces `dist/extension.js` using esbuild with single-entry
bundling.

## Design Patterns

### Promise-based Approval

The approval dialog returns a Promise that resolves with the user's decision.
This enables clean async/await flow in the activation logic.

### Terminal Deduplication

Terminal names include the task name and first 7 characters of content hash.
This prevents terminal proliferation and provides an audit trail.

### Fail-Safe File I/O

`tryReadFile()` returns `null` on any error (missing file, permission denied,
etc.). This prevents crashes from file system issues.

### Composition

The webview UI builds from composable template and style modules. Each module
handles a single responsibility.
