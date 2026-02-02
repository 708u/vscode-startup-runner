import * as path from "node:path";
import picomatch from "picomatch";
import * as vscode from "vscode";

export function isGlobPattern(pattern: string): boolean {
  const state = picomatch.scan(pattern);
  return state.isGlob;
}

export async function expandGlobPattern(
  workspaceFolder: vscode.WorkspaceFolder,
  pattern: string,
): Promise<string[]> {
  if (!isGlobPattern(pattern)) {
    return [path.join(workspaceFolder.uri.fsPath, pattern)];
  }

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
