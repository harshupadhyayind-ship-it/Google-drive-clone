// lib/ui/drive/DashboardContent.tsx
"use client";

import { useDrive } from "@/lib/context/DriveContext";
import { FolderCard } from "./FolderCard";
import { FileCard } from "./FileCard";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { InputDialog } from "@/lib/ui/components/InputDialog";

type RenameTarget = {
  id: string;
  name: string;
  type: "file" | "folder";
};

export const DashboardContent = () => {
  const searchParams = useSearchParams();
  const { folders, files, setFolders, setFiles, refreshDriveData, currentFolderId, isSyncing } =
    useDrive();

  const parentId = searchParams.get("folderId") ?? null;

  const [renameTarget, setRenameTarget] = useState<RenameTarget | null>(null);
  const [renameName, setRenameName] = useState("");

  useEffect(() => {
    if (parentId === currentFolderId) return;
    refreshDriveData(parentId);
  }, [parentId, currentFolderId, refreshDriveData]);

  const openRename = (id: string, name: string, type: "file" | "folder") => {
    setRenameTarget({ id, name, type });
    setRenameName(name);
  };

  const handleRename = async () => {
    if (!renameTarget || !renameName.trim()) return;

    const { id, type } = renameTarget;
    const endpoint = type === "file" ? `/api/file/${id}` : `/api/folder/${id}`;

    const res = await fetch(endpoint, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: renameName.trim() }),
    });

    const updated = await res.json();
    console.log({updated})

    if (type === "file") {
      setFiles((prev: any[]) =>
        prev.map((f) => (f._id === id ? { ...f, name: updated?.name } : f))
      );
    } else {
      setFolders((prev: any[]) =>
        prev.map((f) => (f._id === id ? { ...f, name: updated?.name } : f))
      );
    }

    setRenameTarget(null);
  };

  const handleStar = async (id: string, type: "file" | "folder", isStarred: boolean) => {
    const endpoint = type === "file" ? `/api/file/${id}` : `/api/folder/${id}`;

    await fetch(endpoint, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isStarred }),
    });

    if (type === "file") {
      setFiles((prev: any[]) =>
        prev.map((f) => (f._id === id ? { ...f, isStarred } : f))
      );
    } else {
      setFolders((prev: any[]) =>
        prev.map((f) => (f._id === id ? { ...f, isStarred } : f))
      );
    }
  };

  const handleMoveToTrash = async (id: string, type: "file" | "folder") => {
    const endpoint = type === "file" ? `/api/file/${id}` : `/api/folder/${id}`;

    await fetch(endpoint, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isTrashed: true }),
    });

    if (type === "file") {
      setFiles((prev: any[]) => prev.filter((f) => f._id !== id));
    } else {
      setFolders((prev: any[]) => prev.filter((f) => f._id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">My Drive</h1>

      {isSyncing && (
        <p className="text-sm text-gray-500" aria-live="polite">
          Loading folder contents...
        </p>
      )}

      <section>
        <h2 className="mb-3 text-sm font-medium text-gray-600">Folders</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {folders.length === 0 && (
            <p className="text-sm text-gray-400">No folders</p>
          )}

          {folders.map((folder: any, i: number) => (
            <FolderCard
              key={folder._id ?? i}
              name={folder.name}
              href={`/dashboard?folderId=${folder._id}`}
              isStarred={folder.isStarred}
              onRename={() => openRename(folder._id, folder.name, "folder")}
              onStar={() => handleStar(folder._id, "folder", !folder.isStarred)}
              onMoveToTrash={() => handleMoveToTrash(folder._id, "folder")}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium text-gray-600">Files</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {files.length === 0 && (
            <p className="text-sm text-gray-400">No files</p>
          )}

          {files.map((file: any, i: number) => (
            <FileCard
              key={file._id ?? i}
              id={file._id}
              name={file.name}
              href={file.url}
              isStarred={file.isStarred}
              onRename={() => openRename(file._id, file.name, "file")}
              onStar={() => handleStar(file._id, "file", !file.isStarred)}
              onMoveToTrash={() => handleMoveToTrash(file._id, "file")}
            />
          ))}
        </div>
      </section>

      <InputDialog
        open={!!renameTarget}
        onOpenChange={(open) => !open && setRenameTarget(null)}
        title={`Rename ${renameTarget?.type === "file" ? "File" : "Folder"}`}
        value={renameName}
        onChange={setRenameName}
        onConfirm={handleRename}
        confirmLabel="Rename"
      />
    </div>
  );
};
