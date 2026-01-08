import * as assert from "assert";
import * as crypto from "crypto";
import { getHash } from "./hash";

suite("getHash", () => {
  test("should return SHA256 hash of content", () => {
    const content = "hello world";
    const expected = crypto.createHash("sha256").update(content).digest("hex");

    assert.strictEqual(getHash(content), expected);
  });

  test("should return consistent hash for same content", () => {
    const content = "test content";
    const hash1 = getHash(content);
    const hash2 = getHash(content);

    assert.strictEqual(hash1, hash2);
  });

  test("should return different hash for different content", () => {
    const hash1 = getHash("content1");
    const hash2 = getHash("content2");

    assert.notStrictEqual(hash1, hash2);
  });

  test("should handle empty string", () => {
    const hash = getHash("");
    assert.strictEqual(hash.length, 64);
  });

  test("should handle multiline content", () => {
    const content = "line1\nline2\nline3";
    const hash = getHash(content);
    assert.strictEqual(hash.length, 64);
  });

  test("should handle unicode content", () => {
    const content = "日本語テスト";
    const hash = getHash(content);
    assert.strictEqual(hash.length, 64);
  });
});
