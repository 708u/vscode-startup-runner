import * as path from "path";
import * as vscode from "vscode";
import { TERMINAL_NAME } from "./constants";
import { HashStorage } from "./storage/hashStorage";
import type { PendingExecution, Task } from "./types";
import { tryReadFile } from "./utils/file";
import { getHash } from "./utils/hash";
import { requestApproval } from "./webview/approvalPanel";

export { getHash } from "./utils/hash";
export { escapeHtml } from "./utils/html";

function registerResetCommand(
  context: vscode.ExtensionContext,
  storage: HashStorage
): void {
  const resetCommand = vscode.commands.registerCommand(
    "startupRunner.resetApprovedFiles",
    async () => {
      const files = storage.getAllFilePaths();

      if (files.length === 0) {
        vscode.window.showInformationMessage(
          "Startup Runner: No approved files to reset."
        );
        return;
      }

      const items: vscode.QuickPickItem[] = files.map((f) => ({
        label: path.basename(f),
        description: f,
      }));

      const selected = await vscode.window.showQuickPick(items, {
        title: "Reset Approved Files",
        placeHolder: "Select files to reset",
        canPickMany: true,
      });

      if (!selected || selected.length === 0) {
        return;
      }

      if (selected.length === files.length) {
        await storage.clear();
      } else {
        const filesToRemove = selected
          .map((item) => item.description)
          .filter((desc): desc is string => desc !== undefined);
        await storage.remove(filesToRemove);
      }

      vscode.window.showInformationMessage(
        `Startup Runner: ${selected.length} file(s) have been reset.`
      );
    }
  );
  context.subscriptions.push(resetCommand);
}

function collectPendingExecutions(
  tasks: Task[],
  workspaceFolders: readonly vscode.WorkspaceFolder[]
): PendingExecution[] {
  const pendingExecutions: PendingExecution[] = [];

  for (const folder of workspaceFolders) {
    for (const task of tasks) {
      const filePath = path.join(folder.uri.fsPath, task.file);
      const content = tryReadFile(filePath);
      if (content) {
        pendingExecutions.push({
          filePath,
          content,
          hash: getHash(content),
        });
      }
    }
  }

  return pendingExecutions;
}

async function processApprovals(
  pendingExecutions: PendingExecution[],
  storage: HashStorage
): Promise<PendingExecution[]> {
  const approved: PendingExecution[] = [];

  for (const pending of pendingExecutions) {
    const savedHash = storage.get(pending.filePath);

    if (savedHash === pending.hash) {
      approved.push(pending);
      continue;
    }

    const decision = await requestApproval(pending);

    if (decision === "allow") {
      await storage.set(pending.filePath, pending.hash);
      approved.push(pending);
    } else if (decision === "once") {
      approved.push(pending);
    }
  }

  return approved;
}

function executeApproved(approved: PendingExecution[]): void {
  if (approved.length === 0) {
    return;
  }

  const terminal = vscode.window.createTerminal(TERMINAL_NAME);
  for (const pending of approved) {
    terminal.sendText(`bash "${pending.filePath}"`);
  }
  terminal.show();
}

export async function activate(
  context: vscode.ExtensionContext
): Promise<void> {
  const storage = new HashStorage(context.globalState);

  registerResetCommand(context, storage);

  if (!vscode.workspace.isTrusted) {
    return;
  }

  const config = vscode.workspace.getConfiguration("startupRunner");
  const tasks = config.get<Task[]>("tasks", []);
  const enabledTasks = tasks.filter((t) => t.enabled);
  if (enabledTasks.length === 0) {
    return;
  }

  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    return;
  }

  const pendingExecutions = collectPendingExecutions(
    enabledTasks,
    workspaceFolders
  );
  if (pendingExecutions.length === 0) {
    return;
  }

  const approved = await processApprovals(pendingExecutions, storage);
  executeApproved(approved);
}

export function deactivate(): void {}
