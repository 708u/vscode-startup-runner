import * as assert from "node:assert";
import * as vscode from "vscode";
import { expandGlobPattern, getRelativePath } from "./glob";

suite("expandGlobPattern", () => {
  test("should expand glob pattern to matching files", async () => {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      return;
    }

    const folder = workspaceFolders[0];
    const result = await expandGlobPattern(folder, "**/*.ts");

    assert.ok(Array.isArray(result));
    assert.ok(result.length > 0);
    assert.ok(result.every((p) => p.endsWith(".ts")));
  });

  test("should return sorted results", async () => {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      return;
    }

    const folder = workspaceFolders[0];
    const result = await expandGlobPattern(folder, "**/*.ts");

    const sorted = [...result].sort();
    assert.deepStrictEqual(result, sorted);
  });

  test("should return empty array for non-matching pattern", async () => {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      return;
    }

    const folder = workspaceFolders[0];
    const result = await expandGlobPattern(folder, "**/*.nonexistent");

    assert.ok(Array.isArray(result));
    assert.strictEqual(result.length, 0);
  });
});

suite("getRelativePath", () => {
  test("should return relative path from workspace", () => {
    const result = getRelativePath("/workspace", "/workspace/src/file.ts");
    assert.strictEqual(result, "src/file.ts");
  });

  test("should handle nested paths", () => {
    const result = getRelativePath(
      "/workspace/project",
      "/workspace/project/src/utils/file.ts",
    );
    assert.strictEqual(result, "src/utils/file.ts");
  });

  test("should handle same directory", () => {
    const result = getRelativePath("/workspace", "/workspace/file.ts");
    assert.strictEqual(result, "file.ts");
  });
});
