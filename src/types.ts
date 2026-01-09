export type FilePath = string;
export type ContentHash = string;
export type ApprovedHashes = Record<FilePath, ContentHash>;

export interface Task {
  name: string;
  file: string;
  enabled: boolean;
}

export interface PendingExecution {
  taskName: string;
  filePath: FilePath;
  content: string;
  hash: ContentHash;
}

export type ApprovalDecision = "allow" | "allowByPath" | "once" | "deny";
