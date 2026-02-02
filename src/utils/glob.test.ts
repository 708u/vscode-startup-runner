import * as assert from "node:assert";
import { getRelativePath, isGlobPattern } from "./glob";

suite("isGlobPattern", () => {
  test("should return true for asterisk wildcard", () => {
    assert.strictEqual(isGlobPattern("*.sh"), true);
  });

  test("should return true for double asterisk", () => {
    assert.strictEqual(isGlobPattern("**/*.sh"), true);
  });

  test("should return true for question mark wildcard", () => {
    assert.strictEqual(isGlobPattern("file?.txt"), true);
  });

  test("should return true for bracket pattern", () => {
    assert.strictEqual(isGlobPattern("file[0-9].txt"), true);
  });

  test("should return true for brace pattern", () => {
    assert.strictEqual(isGlobPattern("*.{js,ts}"), true);
  });

  test("should return false for plain path", () => {
    assert.strictEqual(isGlobPattern("path/to/file.sh"), false);
  });

  test("should return false for path with dots", () => {
    assert.strictEqual(isGlobPattern(".startup/setup.sh"), false);
  });

  test("should return false for empty string", () => {
    assert.strictEqual(isGlobPattern(""), false);
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
