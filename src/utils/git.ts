import * as fs from "fs";
import * as path from "path";
import type { FilePath } from "../types";

/**
 * Returns the base repository path if this is a worktree.
 * Returns null if this is the main repository.
 */
export function getBaseRepoPath(workspacePath: string): string | null {
  const gitPath = path.join(workspacePath, ".git");

  try {
    const stat = fs.statSync(gitPath);

    if (stat.isDirectory()) {
      return null;
    }

    const gitFileContent = fs.readFileSync(gitPath, "utf-8");
    const match = gitFileContent.match(/^gitdir:\s*(.+)$/m);

    if (!match) {
      return null;
    }

    const gitdir = match[1].trim();
    const worktreesMatch = gitdir.match(
      /^(.+)[/\\]\.git[/\\]worktrees[/\\].+$/,
    );

    if (!worktreesMatch) {
      return null;
    }

    const baseRepoPath = worktreesMatch[1];

    if (!fs.existsSync(baseRepoPath)) {
      return null;
    }

    return baseRepoPath;
  } catch {
    return null;
  }
}

/**
 * Returns a normalized path for storage purposes.
 * If this is a worktree, converts to the base repository path; otherwise returns as-is.
 */
export function resolveToBaseStoragePath(
  workspacePath: string,
  relativeFile: string,
): FilePath {
  const baseRepoPath = getBaseRepoPath(workspacePath);

  if (baseRepoPath) {
    return path.join(baseRepoPath, relativeFile);
  }

  return path.join(workspacePath, relativeFile);
}
