import * as vscode from "vscode";
import { PATH_APPROVAL_STORAGE_KEY } from "../constants";
import type { FilePath } from "../types";

export class PathApprovalStorage {
  constructor(private readonly globalState: vscode.Memento) {}

  getAll(): FilePath[] {
    return this.globalState.get<FilePath[]>(PATH_APPROVAL_STORAGE_KEY) ?? [];
  }

  has(filePath: FilePath): boolean {
    return this.getAll().includes(filePath);
  }

  async add(filePath: FilePath): Promise<void> {
    const paths = this.getAll();
    if (!paths.includes(filePath)) {
      paths.push(filePath);
      await this.globalState.update(PATH_APPROVAL_STORAGE_KEY, paths);
    }
  }

  async remove(filePaths: FilePath[]): Promise<void> {
    const paths = this.getAll();
    const remaining = paths.filter((p) => !filePaths.includes(p));
    await this.globalState.update(PATH_APPROVAL_STORAGE_KEY, remaining);
  }

  async clear(): Promise<void> {
    await this.globalState.update(PATH_APPROVAL_STORAGE_KEY, undefined);
  }

  getAllFilePaths(): FilePath[] {
    return this.getAll();
  }

  isEmpty(): boolean {
    return this.getAll().length === 0;
  }
}
