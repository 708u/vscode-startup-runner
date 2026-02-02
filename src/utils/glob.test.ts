import * as assert from "node:assert";
import * as fs from "node:fs";
import * as path from "node:path";
import * as vscode from "vscode";
import { expandGlobPattern, getRelativePath } from "./glob";

suite("expandGlobPattern", () => {
  const testDir = ".test-glob-tmp";
  let workspaceFolder: vscode.WorkspaceFolder | undefined;
  let testDirPath: string | undefined;

  suiteSetup(() => {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      return;
    }
    workspaceFolder = workspaceFolders[0];
    testDirPath = path.join(workspaceFolder.uri.fsPath, testDir);

    fs.mkdirSync(testDirPath, { recursive: true });
    fs.mkdirSync(path.join(testDirPath, "nested"), { recursive: true });
    fs.writeFileSync(path.join(testDirPath, "a.sh"), "#!/bin/bash\necho a");
    fs.writeFileSync(path.join(testDirPath, "b.sh"), "#!/bin/bash\necho b");
    fs.writeFileSync(path.join(testDirPath, "c.txt"), "text file");
    fs.writeFileSync(
      path.join(testDirPath, "nested", "d.sh"),
      "#!/bin/bash\necho d",
    );
  });

  suiteTeardown(() => {
    if (testDirPath) {
      fs.rmSync(testDirPath, { recursive: true, force: true });
    }
  });

  test("should match *.sh in directory", async () => {
    if (!workspaceFolder) {
      return;
    }
    const result = await expandGlobPattern(workspaceFolder, `${testDir}/*.sh`);

    assert.strictEqual(result.length, 2);
    assert.ok(result.every((p) => p.endsWith(".sh")));
    assert.ok(result.some((p) => p.includes("a.sh")));
    assert.ok(result.some((p) => p.includes("b.sh")));
  });

  test("should match **/*.sh recursively", async () => {
    if (!workspaceFolder) {
      return;
    }
    const result = await expandGlobPattern(
      workspaceFolder,
      `${testDir}/**/*.sh`,
    );

    assert.strictEqual(result.length, 3);
    assert.ok(result.some((p) => p.includes("a.sh")));
    assert.ok(result.some((p) => p.includes("b.sh")));
    assert.ok(result.some((p) => p.includes("nested/d.sh")));
  });

  test("should match specific file without glob", async () => {
    if (!workspaceFolder) {
      return;
    }
    const result = await expandGlobPattern(workspaceFolder, `${testDir}/a.sh`);

    assert.strictEqual(result.length, 1);
    assert.ok(result[0].endsWith("a.sh"));
  });

  test("should not match different extension", async () => {
    if (!workspaceFolder) {
      return;
    }
    const result = await expandGlobPattern(workspaceFolder, `${testDir}/*.txt`);

    assert.strictEqual(result.length, 1);
    assert.ok(result[0].endsWith("c.txt"));
  });

  test("should return sorted results", async () => {
    if (!workspaceFolder) {
      return;
    }
    const result = await expandGlobPattern(
      workspaceFolder,
      `${testDir}/**/*.sh`,
    );

    const sorted = [...result].sort();
    assert.deepStrictEqual(result, sorted);
  });

  test("should return empty array for non-matching pattern", async () => {
    if (!workspaceFolder) {
      return;
    }
    const result = await expandGlobPattern(
      workspaceFolder,
      `${testDir}/**/*.nonexistent`,
    );

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
