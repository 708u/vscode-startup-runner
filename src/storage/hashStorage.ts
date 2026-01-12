import type * as vscode from "vscode";
import { STORAGE_KEY } from "../constants";
import type { ApprovedHashes, ContentHash, FilePath } from "../types";

export class HashStorage {
  constructor(private readonly globalState: vscode.Memento) {}

  getAll(): ApprovedHashes {
    return this.globalState.get<ApprovedHashes>(STORAGE_KEY) ?? {};
  }

  get(filePath: FilePath): ContentHash | undefined {
    return this.getAll()[filePath];
  }

  async set(filePath: FilePath, hash: ContentHash): Promise<void> {
    const hashes = this.getAll();
    hashes[filePath] = hash;
    await this.globalState.update(STORAGE_KEY, hashes);
  }

  async remove(filePaths: FilePath[]): Promise<void> {
    const hashes = this.getAll();
    for (const filePath of filePaths) {
      delete hashes[filePath];
    }
    await this.globalState.update(STORAGE_KEY, hashes);
  }

  async clear(): Promise<void> {
    await this.globalState.update(STORAGE_KEY, undefined);
  }

  getAllFilePaths(): FilePath[] {
    return Object.keys(this.getAll());
  }

  isEmpty(): boolean {
    return Object.keys(this.getAll()).length === 0;
  }
}
