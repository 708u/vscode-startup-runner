import * as path from "node:path";
import * as vscode from "vscode";

export function isGlobPattern(pattern: string): boolean {
  return /[*?[\]]/.test(pattern);
}

export async function expandGlobPattern(
  workspaceFolder: vscode.WorkspaceFolder,
  pattern: string,
): Promise<string[]> {
  const relativePattern = new vscode.RelativePattern(workspaceFolder, pattern);
  const uris = await vscode.workspace.findFiles(relativePattern);
  return uris.map((uri) => uri.fsPath).sort();
}

export function getRelativePath(
  workspacePath: string,
  absolutePath: string,
): string {
  return path.relative(workspacePath, absolutePath);
}
