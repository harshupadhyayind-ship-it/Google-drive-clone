"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import { CheckCircle2, XCircle, Loader2, ChevronDown, X } from "lucide-react";
import { useDrive } from "./DriveContext";

// ─── Types ────────────────────────────────────────────────────────────────────

export type UploadItem = {
  id: string;
  name: string;
  status: "uploading" | "done" | "error";
};

type FileWithPath = { file: File; path: string };

type UploadContextValue = {
  uploads: UploadItem[];
  /** Upload flat files into a specific folder */
  uploadFiles: (files: File[], folderId: string) => Promise<void>;
  /** Upload files from a webkitdirectory FileList (preserves tree) */
  uploadFolderFileList: (fileList: FileList, folderId: string) => Promise<void>;
  /** Upload anything dropped — handles multiple files AND multiple folders */
  uploadFromDrop: (items: DataTransferItemList, folderId: string) => Promise<void>;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Read all entries from a FileSystemDirectoryReader (batches of up to 100) */
async function readAllEntries(
  reader: FileSystemDirectoryReader
): Promise<FileSystemEntry[]> {
  const all: FileSystemEntry[] = [];
  while (true) {
    const batch = await new Promise<FileSystemEntry[]>((res, rej) =>
      reader.readEntries(res, rej)
    );
    if (batch.length === 0) break;
    all.push(...batch);
  }
  return all;
}

/** Recursively collect every file under an entry, preserving relative paths */
async function collectFiles(
  entry: FileSystemEntry,
  basePath = ""
): Promise<FileWithPath[]> {
  const currentPath = basePath ? `${basePath}/${entry.name}` : entry.name;

  if (entry.isFile) {
    return new Promise((res, rej) =>
      (entry as FileSystemFileEntry).file(
        (file) => res([{ file, path: currentPath }]),
        rej
      )
    );
  }

  if (entry.isDirectory) {
    const reader = (entry as FileSystemDirectoryEntry).createReader();
    const children = await readAllEntries(reader);
    const nested = await Promise.all(
      children.map((child) => collectFiles(child, currentPath))
    );
    return nested.flat();
  }

  return [];
}

// ─── Context ──────────────────────────────────────────────────────────────────

const UploadContext = createContext<UploadContextValue>({
  uploads: [],
  uploadFiles: async () => {},
  uploadFolderFileList: async () => {},
  uploadFromDrop: async () => {},
});

export const useUpload = () => useContext(UploadContext);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function UploadProvider({ children }: { children: ReactNode }) {
  const { setFiles, setFolders, user } = useDrive();

  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [minimised, setMinimised] = useState(false);

  // Auto-dismiss 3 s after all uploads finish
  useEffect(() => {
    if (uploads.length === 0) return;
    if (uploads.some((u) => u.status === "uploading")) return;
    const t = setTimeout(() => setUploads([]), 3000);
    return () => clearTimeout(t);
  }, [uploads]);

  // ── Internal helpers ────────────────────────────────────────────────────────

  const markDone = (uid: string) =>
    setUploads((p) => p.map((u) => (u.id === uid ? { ...u, status: "done" } : u)));

  const markError = (uid: string) =>
    setUploads((p) => p.map((u) => (u.id === uid ? { ...u, status: "error" } : u)));

  const pushQueue = (items: UploadItem[]) => {
    setUploads((p) => [...p, ...items]);
    setMinimised(false);
  };

  /** Upload one file, update queue, optionally surface in drive view */
  const uploadOne = useCallback(
    async (file: File, uid: string, folderId: string, currentFolderId: string) => {
      const form = new FormData();
      form.append("file", file);
      form.append("userId", user.id);
      form.append("folderId", folderId);

      try {
        const res = await fetch("/api/file", { method: "POST", body: form });
        if (!res.ok) throw new Error();
        const saved = await res.json();
        // Surface in the current dashboard view only when the folder matches
        if (folderId === currentFolderId) {
          setFiles((prev: any) => [saved, ...prev]);
        }
        markDone(uid);
      } catch {
        markError(uid);
      }
    },
    [user, setFiles]
  );

  /**
   * Create every folder in `dirPaths` (sorted shallow-first) and return a
   * Map<path → MongoDB _id>.  Root-level folders are surfaced in the drive.
   */
  const createFolderTree = useCallback(
    async (dirPaths: string[], currentFolderId: string): Promise<Map<string, string>> => {
      const sorted = [...dirPaths].sort(
        (a, b) => a.split("/").length - b.split("/").length
      );
      const pathToId = new Map<string, string>();

      for (const dirPath of sorted) {
        const parts = dirPath.split("/");
        const name = parts[parts.length - 1];
        const parentPath = parts.slice(0, -1).join("/");
        const parentId = parentPath
          ? (pathToId.get(parentPath) ?? null)
          : (currentFolderId || null);

        try {
          const res = await fetch("/api/folder", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, userId: user.id, parentId }),
          });
          if (!res.ok) throw new Error();
          const folder = await res.json();
          pathToId.set(dirPath, folder._id);

          // Surface root-level folders in the current view
          if (!parentPath) {
            setFolders((prev: any) => [folder, ...prev]);
          }
        } catch {
          console.error("Failed to create folder:", dirPath);
        }
      }

      return pathToId;
    },
    [user, setFolders]
  );

  // ── Public API ──────────────────────────────────────────────────────────────

  /** Upload flat list of files (no folder structure) */
  const uploadFiles = useCallback(
    async (files: File[], currentFolderId: string) => {
      if (!files.length) return;
      const queue = files.map((f) => ({
        id: `${Date.now()}-${Math.random()}`,
        name: f.name,
        status: "uploading" as const,
      }));
      pushQueue(queue);
      await Promise.all(
        files.map((f, i) => uploadOne(f, queue[i].id, currentFolderId, currentFolderId))
      );
    },
    [uploadOne]
  );

  /** Upload a webkitdirectory FileList, preserving the folder tree */
  const uploadFolderFileList = useCallback(
    async (fileList: FileList, currentFolderId: string) => {
      const files = Array.from(fileList);
      if (!files.length) return;

      // Collect unique directory paths
      const dirSet = new Set<string>();
      files.forEach((f) => {
        const parts = f.webkitRelativePath.split("/");
        for (let i = 1; i < parts.length; i++) {
          dirSet.add(parts.slice(0, i).join("/"));
        }
      });

      const pathToId = await createFolderTree(Array.from(dirSet), currentFolderId);

      const queue = files.map((f) => ({
        id: `${Date.now()}-${Math.random()}`,
        name: f.name,
        status: "uploading" as const,
      }));
      pushQueue(queue);

      await Promise.all(
        files.map((f, i) => {
          const parts = f.webkitRelativePath.split("/");
          const dirPath = parts.slice(0, -1).join("/");
          const folderId = pathToId.get(dirPath) ?? currentFolderId;
          return uploadOne(f, queue[i].id, folderId, currentFolderId);
        })
      );
    },
    [createFolderTree, uploadOne]
  );

  /**
   * Process a DataTransferItemList from a drop event.
   * Supports dropping multiple files AND multiple folders simultaneously.
   */
  const uploadFromDrop = useCallback(
    async (items: DataTransferItemList, currentFolderId: string) => {
      // Collect FileSystemEntry for every dropped item
      const entries: FileSystemEntry[] = [];
      for (let i = 0; i < items.length; i++) {
        const entry = items[i].webkitGetAsEntry?.();
        if (entry) entries.push(entry);
      }
      if (!entries.length) return;

      // Recursively collect all files with their relative paths
      const allFiles: FileWithPath[] = (
        await Promise.all(entries.map((e) => collectFiles(e)))
      ).flat();

      if (!allFiles.length) return;

      // Build unique directory paths (exclude root "" = currentFolderId)
      const dirSet = new Set<string>();
      allFiles.forEach(({ path }) => {
        const parts = path.split("/");
        for (let i = 1; i < parts.length; i++) {
          dirSet.add(parts.slice(0, i).join("/"));
        }
      });

      // Create folder tree if there are any subdirectories
      const pathToId =
        dirSet.size > 0
          ? await createFolderTree(Array.from(dirSet), currentFolderId)
          : new Map<string, string>();

      // Queue all files
      const queue = allFiles.map(({ file }) => ({
        id: `${Date.now()}-${Math.random()}`,
        name: file.name,
        status: "uploading" as const,
      }));
      pushQueue(queue);

      // Upload in parallel
      await Promise.all(
        allFiles.map(({ file, path }, i) => {
          const parts = path.split("/");
          const dirPath = parts.slice(0, -1).join("/");
          const folderId = dirPath
            ? (pathToId.get(dirPath) ?? currentFolderId)
            : currentFolderId;
          return uploadOne(file, queue[i].id, folderId, currentFolderId);
        })
      );
    },
    [createFolderTree, uploadOne]
  );

  // ── Progress panel ──────────────────────────────────────────────────────────

  const doneCount      = uploads.filter((u) => u.status === "done").length;
  const errorCount     = uploads.filter((u) => u.status === "error").length;
  const uploadingCount = uploads.filter((u) => u.status === "uploading").length;

  return (
    <UploadContext.Provider value={{ uploads, uploadFiles, uploadFolderFileList, uploadFromDrop }}>
      {children}

      {uploads.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 w-72 rounded-xl border border-border bg-card shadow-2xl shadow-black/30 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-muted/40 border-b border-border">
            <span className="text-sm font-medium text-foreground">
              {uploadingCount > 0
                ? `Uploading ${uploadingCount} file${uploadingCount !== 1 ? "s" : ""}…`
                : errorCount > 0
                ? `${doneCount} uploaded, ${errorCount} failed`
                : `${doneCount} file${doneCount !== 1 ? "s" : ""} uploaded`}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMinimised((p) => !p)}
                className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronDown
                  size={14}
                  className={`transition-transform ${minimised ? "rotate-180" : ""}`}
                />
              </button>
              <button
                onClick={() => setUploads([])}
                className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* File rows */}
          {!minimised && (
            <ul className="max-h-52 overflow-y-auto divide-y divide-border">
              {uploads.map((u) => (
                <li key={u.id} className="flex items-center gap-3 px-4 py-2.5">
                  {u.status === "uploading" && (
                    <Loader2 size={16} className="shrink-0 text-primary animate-spin" />
                  )}
                  {u.status === "done" && (
                    <CheckCircle2 size={16} className="shrink-0 text-green-500" />
                  )}
                  {u.status === "error" && (
                    <XCircle size={16} className="shrink-0 text-destructive" />
                  )}
                  <span className="text-sm text-foreground truncate">{u.name}</span>
                  <span
                    className={`ml-auto text-xs shrink-0 ${
                      u.status === "done"
                        ? "text-green-500"
                        : u.status === "error"
                        ? "text-destructive"
                        : "text-muted-foreground"
                    }`}
                  >
                    {u.status === "uploading"
                      ? "Uploading"
                      : u.status === "done"
                      ? "Done"
                      : "Failed"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </UploadContext.Provider>
  );
}
