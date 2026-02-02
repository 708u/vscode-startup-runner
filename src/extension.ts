import * as path from "node:path";
import * as vscode from "vscode";
import { GlobApprovalStorage } from "./storage/globApprovalStorage";
import { HashStorage } from "./storage/hashStorage";
import { PathApprovalStorage } from "./storage/pathApprovalStorage";
import type { PendingExecution, Task } from "./types";
import { tryReadFile } from "./utils/file";
import { resolveToBaseStoragePath } from "./utils/git";
import {
  expandGlobPattern,
  getRelativePath,
  isGlobPattern,
} from "./utils/glob";
import { getHash } from "./utils/hash";
import { buildTerminalName } from "./utils/terminal";
import { requestApproval } from "./webview/approvalPanel";

export { getHash } from "./utils/hash";
export { escapeHtml } from "./utils/html";

function registerResetCommand(
  context: vscode.ExtensionContext,
  hashStorage: HashStorage,
  pathStorage: PathApprovalStorage,
  globStorage: GlobApprovalStorage,
): void {
  const resetCommand = vscode.commands.registerCommand(
    "startupRunner.resetApprovedFiles",
    async () => {
      const hashFiles = hashStorage.getAllFilePaths();
      const pathFiles = pathStorage.getAllFilePaths();
      const globPatterns = globStorage.getAllPatterns();

      interface ApprovalItem extends vscode.QuickPickItem {
        filePath: string;
        storageType: "hash" | "path" | "glob";
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

      const globItems: ApprovalItem[] = globPatterns.map((p) => ({
        label: p,
        description: `${p} (glob-based)`,
        filePath: p,
        storageType: "glob",
      }));

      const allItems = [...hashItems, ...pathItems, ...globItems];

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
      const globPatternsToRemove = selected
        .filter((item) => item.storageType === "glob")
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

      if (globPatternsToRemove.length === globPatterns.length) {
        await globStorage.clear();
      } else if (globPatternsToRemove.length > 0) {
        await globStorage.remove(globPatternsToRemove);
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
  globStorage: GlobApprovalStorage,
): Promise<PendingExecution[]> {
  const approved: PendingExecution[] = [];

  for (const pending of pendingExecutions) {
    if (pending.globPattern && globStorage.has(pending.globPattern)) {
      approved.push(pending);
      continue;
    }

    if (pathStorage.has(pending.storageKey)) {
      approved.push(pending);
      continue;
    }

    const savedHash = hashStorage.get(pending.storageKey);

    if (savedHash === pending.hash) {
      approved.push(pending);
      continue;
    }

    const isChanged = savedHash !== undefined;
    const decision = await requestApproval(pending, { isChanged });

    if (decision === "allow") {
      await hashStorage.set(pending.storageKey, pending.hash);
      approved.push(pending);
    } else if (decision === "allowByPath") {
      await pathStorage.add(pending.storageKey);
      approved.push(pending);
    } else if (decision === "allowByGlob" && pending.globPattern) {
      await globStorage.add(pending.globPattern);
      approved.push(pending);
    } else if (decision === "once") {
      approved.push(pending);
    }
  }

  return approved;
}

function getOrCreateTerminal(
  taskName: string,
  filePath: string,
  hash: string,
): vscode.Terminal {
  const terminalName = buildTerminalName(taskName, filePath, hash);
  const existing = vscode.window.terminals.find((t) => t.name === terminalName);
  return existing ?? vscode.window.createTerminal(terminalName);
}

function executeApproved(approved: PendingExecution[]): void {
  if (approved.length === 0) {
    return;
  }

  for (const pending of approved) {
    const terminal = getOrCreateTerminal(
      pending.taskName,
      pending.filePath,
      pending.hash,
    );
    terminal.sendText(`bash "${pending.filePath}"`);
    terminal.show(true);
  }
}

export async function activate(
  context: vscode.ExtensionContext,
): Promise<void> {
  const hashStorage = new HashStorage(context.globalState);
  const pathStorage = new PathApprovalStorage(context.globalState);
  const globStorage = new GlobApprovalStorage(context.globalState);

  registerResetCommand(context, hashStorage, pathStorage, globStorage);

  if (!vscode.workspace.isTrusted) {
    return;
  }

  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    return;
  }

  const globalConfig = vscode.workspace.getConfiguration("startupRunner");
  const shareApproval = globalConfig.get<boolean>(
    "worktree.shareApproval",
    true,
  );

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

    const seenFiles = new Set<string>();
    for (const task of uniqueTasks) {
      const expandedPaths = await expandGlobPattern(folder, task.file);
      const globPattern = isGlobPattern(task.file) ? task.file : undefined;

      for (const filePath of expandedPaths) {
        if (seenFiles.has(filePath)) {
          continue;
        }
        seenFiles.add(filePath);

        const relativePath = getRelativePath(folder.uri.fsPath, filePath);
        const storageKey = shareApproval
          ? resolveToBaseStoragePath(folder.uri.fsPath, relativePath)
          : filePath;
        const content = tryReadFile(filePath);
        if (content) {
          pendingExecutions.push({
            taskName: task.name,
            filePath,
            storageKey,
            content,
            hash: getHash(content),
            globPattern,
          });
        }
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
    globStorage,
  );
  executeApproved(approved);
}

export function deactivate(): void {}
