# startup-runner

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
    { "name": "default", "file": ".autorun", "enabled": true }
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
  - `file`: Trigger file name
  - `enabled`: Enable this task

Default: `[]` (empty, no tasks configured)
