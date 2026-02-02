import * as assert from "node:assert";
import { buildTerminalName } from "./terminal";

suite("buildTerminalName", () => {
  test("should include task name, filename, and short hash", () => {
    const result = buildTerminalName(
      "scripts",
      "/workspace/scripts/setup.sh",
      "abc1234567890",
    );

    assert.strictEqual(result, "Startup Runner: scripts/setup.sh (abc1234)");
  });

  test("should truncate hash to 7 characters", () => {
    const result = buildTerminalName(
      "task",
      "/path/to/file.sh",
      "1234567890abcdef",
    );

    assert.ok(result.includes("(1234567)"));
    assert.ok(!result.includes("890abcdef"));
  });

  test("should extract basename from full path", () => {
    const result = buildTerminalName(
      "task",
      "/very/long/nested/path/to/script.sh",
      "abcdefg",
    );

    assert.ok(result.includes("script.sh"));
    assert.ok(!result.includes("/very/long"));
  });

  test("should handle Windows-style paths", () => {
    const result = buildTerminalName(
      "task",
      "C:\\Users\\test\\script.sh",
      "abcdefg",
    );

    assert.ok(result.includes("script.sh"));
  });
});
