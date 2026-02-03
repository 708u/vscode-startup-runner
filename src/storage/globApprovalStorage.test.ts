import * as assert from "node:assert";
import type * as vscode from "vscode";
import { GlobApprovalStorage } from "./globApprovalStorage";

class MockMemento implements vscode.Memento {
  private storage: Map<string, unknown> = new Map();

  keys(): readonly string[] {
    return Array.from(this.storage.keys());
  }

  get<T>(key: string): T | undefined;
  get<T>(key: string, defaultValue: T): T;
  get<T>(key: string, defaultValue?: T): T | undefined {
    const value = this.storage.get(key);
    return value !== undefined ? (value as T) : defaultValue;
  }

  async update(key: string, value: unknown): Promise<void> {
    if (value === undefined) {
      this.storage.delete(key);
    } else {
      this.storage.set(key, value);
    }
  }

  setKeysForSync(_keys: readonly string[]): void {}
}

suite("GlobApprovalStorage", () => {
  let memento: MockMemento;
  let storage: GlobApprovalStorage;

  setup(() => {
    memento = new MockMemento();
    storage = new GlobApprovalStorage(memento);
  });

  test("should return empty array when no patterns stored", () => {
    assert.deepStrictEqual(storage.getAll(), []);
    assert.deepStrictEqual(storage.getAllPatterns(), []);
  });

  test("should add and retrieve pattern", async () => {
    await storage.add("*.sh");

    assert.deepStrictEqual(storage.getAll(), ["*.sh"]);
    assert.strictEqual(storage.has("*.sh"), true);
  });

  test("should not add duplicate patterns", async () => {
    await storage.add("*.sh");
    await storage.add("*.sh");

    assert.deepStrictEqual(storage.getAll(), ["*.sh"]);
  });

  test("should add multiple patterns", async () => {
    await storage.add("*.sh");
    await storage.add("**/*.ts");
    await storage.add("src/*.js");

    assert.strictEqual(storage.getAll().length, 3);
    assert.strictEqual(storage.has("*.sh"), true);
    assert.strictEqual(storage.has("**/*.ts"), true);
    assert.strictEqual(storage.has("src/*.js"), true);
  });

  test("should return false for non-existent pattern", () => {
    assert.strictEqual(storage.has("*.sh"), false);
  });

  test("should remove patterns", async () => {
    await storage.add("*.sh");
    await storage.add("**/*.ts");
    await storage.add("src/*.js");

    await storage.remove(["*.sh", "src/*.js"]);

    assert.deepStrictEqual(storage.getAll(), ["**/*.ts"]);
    assert.strictEqual(storage.has("*.sh"), false);
    assert.strictEqual(storage.has("**/*.ts"), true);
    assert.strictEqual(storage.has("src/*.js"), false);
  });

  test("should clear all patterns", async () => {
    await storage.add("*.sh");
    await storage.add("**/*.ts");

    await storage.clear();

    assert.deepStrictEqual(storage.getAll(), []);
    assert.strictEqual(storage.isEmpty(), true);
  });

  test("should report isEmpty correctly", async () => {
    assert.strictEqual(storage.isEmpty(), true);

    await storage.add("*.sh");
    assert.strictEqual(storage.isEmpty(), false);

    await storage.clear();
    assert.strictEqual(storage.isEmpty(), true);
  });

  test("getAllPatterns should return same as getAll", async () => {
    await storage.add("*.sh");
    await storage.add("**/*.ts");

    assert.deepStrictEqual(storage.getAllPatterns(), storage.getAll());
  });
});
