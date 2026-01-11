import * as assert from "assert";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { getBaseRepoPath, resolveToBaseStoragePath } from "./git";

suite("getBaseRepoPath", () => {
  let tempDir: string;

  suiteSetup(() => {
    tempDir = fs.mkdtempSync(
      path.join(os.tmpdir(), "startup-runner-git-test-"),
    );
  });

  suiteTeardown(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test("should return null for main repository (.git is directory)", () => {
    const mainRepo = path.join(tempDir, "main-repo");
    fs.mkdirSync(mainRepo);
    fs.mkdirSync(path.join(mainRepo, ".git"));

    const result = getBaseRepoPath(mainRepo);
    assert.strictEqual(result, null);
  });

  test("should return null when .git does not exist", () => {
    const noGitDir = path.join(tempDir, "no-git");
    fs.mkdirSync(noGitDir);

    const result = getBaseRepoPath(noGitDir);
    assert.strictEqual(result, null);
  });

  test("should return base repo path for worktree", () => {
    const baseRepo = path.join(tempDir, "base-repo");
    const worktree = path.join(tempDir, "worktree");

    fs.mkdirSync(baseRepo);
    fs.mkdirSync(path.join(baseRepo, ".git"));
    fs.mkdirSync(path.join(baseRepo, ".git", "worktrees"), { recursive: true });
    fs.mkdirSync(path.join(baseRepo, ".git", "worktrees", "feature-branch"));

    fs.mkdirSync(worktree);
    const gitFilePath = path.join(worktree, ".git");
    const gitdir = path.join(baseRepo, ".git", "worktrees", "feature-branch");
    fs.writeFileSync(gitFilePath, `gitdir: ${gitdir}\n`);

    const result = getBaseRepoPath(worktree);
    assert.strictEqual(result, baseRepo);
  });

  test("should return null for invalid .git file content", () => {
    const invalidWorktree = path.join(tempDir, "invalid-worktree");
    fs.mkdirSync(invalidWorktree);
    fs.writeFileSync(path.join(invalidWorktree, ".git"), "invalid content");

    const result = getBaseRepoPath(invalidWorktree);
    assert.strictEqual(result, null);
  });

  test("should return null when gitdir does not match worktree pattern", () => {
    const submodule = path.join(tempDir, "submodule");
    fs.mkdirSync(submodule);
    fs.writeFileSync(
      path.join(submodule, ".git"),
      "gitdir: /some/other/path/.git/modules/submodule\n",
    );

    const result = getBaseRepoPath(submodule);
    assert.strictEqual(result, null);
  });
});

suite("resolveToBaseStoragePath", () => {
  let tempDir: string;

  suiteSetup(() => {
    tempDir = fs.mkdtempSync(
      path.join(os.tmpdir(), "startup-runner-storage-test-"),
    );
  });

  suiteTeardown(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test("should return joined path for main repository", () => {
    const mainRepo = path.join(tempDir, "main-repo-storage");
    fs.mkdirSync(mainRepo);
    fs.mkdirSync(path.join(mainRepo, ".git"));

    const result = resolveToBaseStoragePath(mainRepo, ".autorun");
    assert.strictEqual(result, path.join(mainRepo, ".autorun"));
  });

  test("should return base repo path for worktree", () => {
    const baseRepo = path.join(tempDir, "base-repo-storage");
    const worktree = path.join(tempDir, "worktree-storage");

    fs.mkdirSync(baseRepo);
    fs.mkdirSync(path.join(baseRepo, ".git"));
    fs.mkdirSync(path.join(baseRepo, ".git", "worktrees"), { recursive: true });
    fs.mkdirSync(path.join(baseRepo, ".git", "worktrees", "feature"));

    fs.mkdirSync(worktree);
    const gitdir = path.join(baseRepo, ".git", "worktrees", "feature");
    fs.writeFileSync(path.join(worktree, ".git"), `gitdir: ${gitdir}\n`);

    const result = resolveToBaseStoragePath(worktree, ".autorun");
    assert.strictEqual(result, path.join(baseRepo, ".autorun"));
  });

  test("should return joined path when .git does not exist", () => {
    const noGitDir = path.join(tempDir, "no-git-storage");
    fs.mkdirSync(noGitDir);

    const result = resolveToBaseStoragePath(noGitDir, ".autorun");
    assert.strictEqual(result, path.join(noGitDir, ".autorun"));
  });
});
