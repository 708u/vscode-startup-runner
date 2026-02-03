import type * as vscode from "vscode";
import { GLOB_APPROVAL_STORAGE_KEY } from "../constants";

export class GlobApprovalStorage {
  constructor(private readonly globalState: vscode.Memento) {}

  getAll(): string[] {
    return this.globalState.get<string[]>(GLOB_APPROVAL_STORAGE_KEY) ?? [];
  }

  has(pattern: string): boolean {
    return this.getAll().includes(pattern);
  }

  async add(pattern: string): Promise<void> {
    const patterns = this.getAll();
    if (!patterns.includes(pattern)) {
      patterns.push(pattern);
      await this.globalState.update(GLOB_APPROVAL_STORAGE_KEY, patterns);
    }
  }

  async remove(patterns: string[]): Promise<void> {
    const current = this.getAll();
    const remaining = current.filter((p) => !patterns.includes(p));
    await this.globalState.update(GLOB_APPROVAL_STORAGE_KEY, remaining);
  }

  async clear(): Promise<void> {
    await this.globalState.update(GLOB_APPROVAL_STORAGE_KEY, undefined);
  }

  getAllPatterns(): string[] {
    return this.getAll();
  }

  isEmpty(): boolean {
    return this.getAll().length === 0;
  }
}
