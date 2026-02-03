# startup-runner

[![VS Code Marketplace](https://img.shields.io/visual-studio-marketplace/v/708u.startup-runner)](https://marketplace.visualstudio.com/items?itemName=708u.startup-runner)

Automatically run commands from trigger files when a VS Code workspace opens.

## Features

- Execute commands from trigger files on workspace startup
- Configure multiple tasks with different trigger files
- Enable/disable individual tasks

## Usage

### 1. Create a trigger file

Create a file in your workspace root (e.g., `.autorun`) with the command to run:

```bash
echo "Hello from autorun"
```

### 2. Configure tasks

Add to your `settings.json`:

```json
{
  "startupRunner.tasks": [
    { "name": "default", "file": ".autorun", "enabled": true },
    { "name": "shell-scripts", "file": ".startup/*.sh", "enabled": true }
  ]
}
```

### 3. Reopen workspace

When you open the workspace, enabled tasks will run automatically if their
trigger files exist.

## Extension Settings

This extension contributes the following settings:

- `startupRunner.tasks`: List of tasks with trigger files
  - `name`: Task name
  - `file`: Trigger file path or glob pattern (e.g., `.autorun`, `*.sh`, `**/*.sh`)
  - `enabled`: Enable this task

Default: `[]` (empty, no tasks configured)

- `startupRunner.worktree.shareApproval`: Share approval state across git
  worktrees (default: `true`)
  - When `true`, approvals are stored using the base repository path, allowing
    approval decisions to be shared across all worktrees of the same repository
  - When `false`, each worktree maintains its own independent approval state

## Security

This extension executes arbitrary shell scripts. Please be aware of the
following security considerations:

### Security Model

The extension uses a three-layer approval system:

1. **Workspace Trust Integration**: The extension only runs in trusted
   workspaces. If VS Code's Workspace Trust is not granted, no scripts will
   execute.

2. **Content-Hash Approval**: Each script's content is hashed (SHA256). When a
   script is first encountered or modified, you must explicitly approve it
   through a review dialog.

3. **Path-Based Approval**: Approves a file path regardless of content changes.
   Suitable for dynamically generated scripts that change frequently.

4. **Glob-Based Approval**: Approves all files matching a glob pattern. This
   option appears only when the task uses a glob pattern (e.g., `*.sh`).

5. **Content Review**: Before approval, the full script content is displayed
   in a webview panel so you can inspect what will be executed.

### Approval Decisions

| Decision | Behavior |
|----------|----------|
| Allow Content | Store content hash, re-ask if changed |
| Allow by Glob | Trust glob pattern, never re-ask for matching files |
| Allow by Path | Trust path, never re-ask |
| Run Once | Execute without saving |
| Deny | Skip execution |

### Best Practices

- **Only use in trusted repositories**: Do not enable this extension for
  repositories from untrusted sources.
- **Review scripts carefully**: Always read the script content before clicking
  "Allow". Be cautious of obfuscated code or external downloads
  (e.g., `curl | bash`).
- **Use "Allow Once" for unfamiliar scripts**: If unsure, use "Allow Once"
  instead of permanent approval.

### Commands

- `Startup Runner: Reset Approved Files...`: Revoke previously approved scripts
  and require re-approval on next startup.
