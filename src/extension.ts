import * as path from "path";
import * as vscode from "vscode";
import { TERMINAL_NAME } from "./constants";
import { HashStorage } from "./storage/hashStorage";
import { PathApprovalStorage } from "./storage/pathApprovalStorage";
import type { PendingExecution, Task } from "./types";
import { tryReadFile } from "./utils/file";
import { getHash } from "./utils/hash";
import { requestApproval } from "./webview/approvalPanel";

export { getHash } from "./utils/hash";
export { escapeHtml } from "./utils/html";

function registerResetCommand(
  context: vscode.ExtensionContext,
  hashStorage: HashStorage,
  pathStorage: PathApprovalStorage,
): void {
  const resetCommand = vscode.commands.registerCommand(
    "startupRunner.resetApprovedFiles",
    async () => {
      const hashFiles = hashStorage.getAllFilePaths();
      const pathFiles = pathStorage.getAllFilePaths();

      interface ApprovalItem extends vscode.QuickPickItem {
        filePath: string;
        storageType: "hash" | "path";
      }

      const hashItems: ApprovalItem[] = hashFiles.map((f) => ({
        label: path.basename(f),
        description: `${f} (content-based)`,
        filePath: f,
        storageType: "hash",
      }));

      const pathItems: ApprovalItem[] = pathFiles.map((f) => ({
        label: path.basename(f),
        description: `${f} (path-based)`,
        filePath: f,
        storageType: "path",
      }));

      const allItems = [...hashItems, ...pathItems];

      if (allItems.length === 0) {
        vscode.window.showInformationMessage(
          "Startup Runner: No approved files to reset.",
        );
        return;
      }

      const selected = await vscode.window.showQuickPick(allItems, {
        title: "Reset Approved Files",
        placeHolder: "Select files to reset",
        canPickMany: true,
      });

      if (!selected || selected.length === 0) {
        return;
      }

      const hashFilesToRemove = selected
        .filter((item) => item.storageType === "hash")
        .map((item) => item.filePath);
      const pathFilesToRemove = selected
        .filter((item) => item.storageType === "path")
        .map((item) => item.filePath);

      if (hashFilesToRemove.length === hashFiles.length) {
        await hashStorage.clear();
      } else if (hashFilesToRemove.length > 0) {
        await hashStorage.remove(hashFilesToRemove);
      }

      if (pathFilesToRemove.length === pathFiles.length) {
        await pathStorage.clear();
      } else if (pathFilesToRemove.length > 0) {
        await pathStorage.remove(pathFilesToRemove);
      }

      vscode.window.showInformationMessage(
        `Startup Runner: ${selected.length} file(s) have been reset.`,
      );
    },
  );
  context.subscriptions.push(resetCommand);
}

async function processApprovals(
  pendingExecutions: PendingExecution[],
  hashStorage: HashStorage,
  pathStorage: PathApprovalStorage,
): Promise<PendingExecution[]> {
  const approved: PendingExecution[] = [];

  for (const pending of pendingExecutions) {
    if (pathStorage.has(pending.filePath)) {
      approved.push(pending);
      continue;
    }

    const savedHash = hashStorage.get(pending.filePath);

    if (savedHash === pending.hash) {
      approved.push(pending);
      continue;
    }

    const isChanged = savedHash !== undefined;
    const decision = await requestApproval(pending, { isChanged });

    if (decision === "allow") {
      await hashStorage.set(pending.filePath, pending.hash);
      approved.push(pending);
    } else if (decision === "allowByPath") {
      await pathStorage.add(pending.filePath);
      approved.push(pending);
    } else if (decision === "once") {
      approved.push(pending);
    }
  }

  return approved;
}

function getOrCreateTerminal(taskName: string, hash: string): vscode.Terminal {
  const shortHash = hash.slice(0, 7);
  const terminalName = `${TERMINAL_NAME}: ${taskName} (${shortHash})`;
  const existing = vscode.window.terminals.find((t) => t.name === terminalName);
  return existing ?? vscode.window.createTerminal(terminalName);
}

function executeApproved(approved: PendingExecution[]): void {
  if (approved.length === 0) {
    return;
  }

  for (const pending of approved) {
    const terminal = getOrCreateTerminal(pending.taskName, pending.hash);
    terminal.sendText(`bash "${pending.filePath}"`);
    terminal.show(true);
  }
}

export async function activate(
  context: vscode.ExtensionContext,
): Promise<void> {
  const hashStorage = new HashStorage(context.globalState);
  const pathStorage = new PathApprovalStorage(context.globalState);

  registerResetCommand(context, hashStorage, pathStorage);

  if (!vscode.workspace.isTrusted) {
    return;
  }

  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    return;
  }

  const pendingExecutions: PendingExecution[] = [];
  for (const folder of workspaceFolders) {
    const config = vscode.workspace.getConfiguration(
      "startupRunner",
      folder.uri,
    );
    const tasks = config.get<Task[]>("tasks", []);
    const enabledTasks = tasks.filter((t) => t.enabled);

    const seen = new Set<string>();
    const uniqueTasks = enabledTasks.filter((t) => {
      const key = `${t.name}:${t.file}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });

    for (const task of uniqueTasks) {
      const filePath = path.join(folder.uri.fsPath, task.file);
      const content = tryReadFile(filePath);
      if (content) {
        pendingExecutions.push({
          taskName: task.name,
          filePath,
          content,
          hash: getHash(content),
        });
      }
    }
  }
  if (pendingExecutions.length === 0) {
    return;
  }

  const approved = await processApprovals(
    pendingExecutions,
    hashStorage,
    pathStorage,
  );
  executeApproved(approved);
}

export function deactivate(): void {}
