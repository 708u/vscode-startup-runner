import * as assert from "node:assert";
import { getRelativePath } from "./glob";

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
