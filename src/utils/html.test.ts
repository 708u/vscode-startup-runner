import * as assert from "node:assert";
import { escapeHtml } from "./html";

suite("escapeHtml", () => {
  test("should escape ampersand", () => {
    assert.strictEqual(escapeHtml("foo & bar"), "foo &amp; bar");
  });

  test("should escape less than", () => {
    assert.strictEqual(escapeHtml("a < b"), "a &lt; b");
  });

  test("should escape greater than", () => {
    assert.strictEqual(escapeHtml("a > b"), "a &gt; b");
  });

  test("should escape double quotes", () => {
    assert.strictEqual(escapeHtml('say "hello"'), "say &quot;hello&quot;");
  });

  test("should escape all special characters together", () => {
    const input = '<script>alert("XSS & attack")</script>';
    const expected =
      "&lt;script&gt;alert(&quot;XSS &amp; attack&quot;)&lt;/script&gt;";
    assert.strictEqual(escapeHtml(input), expected);
  });

  test("should return same string if no special characters", () => {
    const input = "hello world 123";
    assert.strictEqual(escapeHtml(input), input);
  });

  test("should handle empty string", () => {
    assert.strictEqual(escapeHtml(""), "");
  });

  test("should handle string with only special characters", () => {
    assert.strictEqual(escapeHtml('<>&"'), "&lt;&gt;&amp;&quot;");
  });
});
