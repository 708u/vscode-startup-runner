import * as assert from "assert";
import * as vscode from "vscode";
import type { Task } from "./types";

suite("Extension", () => {
  suite("Configuration", () => {
    test("should have default configuration", () => {
      const config = vscode.workspace.getConfiguration("startupRunner");
      const tasks = config.get<Task[]>("tasks");

      assert.ok(Array.isArray(tasks));
    });

    test("should read tasks configuration", () => {
      const config = vscode.workspace.getConfiguration("startupRunner");
      const tasks = config.get<Task[]>("tasks", []);

      for (const task of tasks) {
        assert.ok(typeof task.name === "string");
        assert.ok(typeof task.file === "string");
        assert.ok(typeof task.enabled === "boolean");
      }
    });
  });

  suite("Activation", () => {
    test("should register resetApprovedFiles command", async () => {
      const commands = await vscode.commands.getCommands(true);
      assert.ok(commands.includes("startupRunner.resetApprovedFiles"));
    });
  });
});
