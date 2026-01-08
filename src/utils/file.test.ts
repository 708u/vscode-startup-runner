import * as assert from "assert";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { tryReadFile } from "./file";

suite("tryReadFile", () => {
  let tempDir: string;

  suiteSetup(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "startup-runner-test-"));
  });

  suiteTeardown(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test("should read file content", () => {
    const filePath = path.join(tempDir, "test.txt");
    fs.writeFileSync(filePath, "hello world");

    const content = tryReadFile(filePath);
    assert.strictEqual(content, "hello world");
  });

  test("should trim whitespace from content", () => {
    const filePath = path.join(tempDir, "whitespace.txt");
    fs.writeFileSync(filePath, "  content with spaces  \n");

    const content = tryReadFile(filePath);
    assert.strictEqual(content, "content with spaces");
  });

  test("should return null for non-existent file", () => {
    const filePath = path.join(tempDir, "non-existent.txt");

    const content = tryReadFile(filePath);
    assert.strictEqual(content, null);
  });

  test("should return null for empty file", () => {
    const filePath = path.join(tempDir, "empty.txt");
    fs.writeFileSync(filePath, "");

    const content = tryReadFile(filePath);
    assert.strictEqual(content, null);
  });

  test("should return null for file with only whitespace", () => {
    const filePath = path.join(tempDir, "whitespace-only.txt");
    fs.writeFileSync(filePath, "   \n\t  ");

    const content = tryReadFile(filePath);
    assert.strictEqual(content, null);
  });

  test("should handle multiline content", () => {
    const filePath = path.join(tempDir, "multiline.txt");
    const multilineContent = "line1\nline2\nline3";
    fs.writeFileSync(filePath, multilineContent);

    const content = tryReadFile(filePath);
    assert.strictEqual(content, multilineContent);
  });

  test("should handle unicode content", () => {
    const filePath = path.join(tempDir, "unicode.txt");
    const unicodeContent = "日本語テスト";
    fs.writeFileSync(filePath, unicodeContent);

    const content = tryReadFile(filePath);
    assert.strictEqual(content, unicodeContent);
  });
});
