// lib/ui/drive/DashboardContent.tsx
"use client";

import { useDrive } from "@/lib/context/DriveContext";
import { FolderCard } from "./FolderCard";
import { FileCard } from "./FileCard";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export const DashboardContent = () => {
  const searchParams = useSearchParams();
  const { folders, files, refreshDriveData, currentFolderId, isSyncing } =
    useDrive();

  const parentId = searchParams.get("folderId") ?? null;

  // When `?folderId=...` changes, refetch folder contents from the API.
  // This prevents stale state when Next doesn't remount server layouts.
  useEffect(() => {
    if (parentId === currentFolderId) return;
    refreshDriveData(parentId);
  }, [parentId, currentFolderId, refreshDriveData]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">My Drive</h1>

      {isSyncing && (
        <p className="text-sm text-gray-500" aria-live="polite">
          Loading folder contents...
        </p>
      )}

      <section>
        <h2 className="mb-3 text-sm font-medium text-gray-600">
          Folders
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {folders.length === 0 && (
            <p className="text-sm text-gray-400">No folders</p>
          )}

          {folders.map((folder: any) => (
            <FolderCard
              key={folder._id}
              name={folder.name}
              href={`/dashboard?folderId=${folder._id}`}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium text-gray-600">
          Files
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {files.length === 0 && (
            <p className="text-sm text-gray-400">No files</p>
          )}

          {files.map((file: any) => (
            <FileCard
              key={file._id}
              name={file.name}
              href={file.url}
            />
          ))}
        </div>
      </section>
    </div>
  );
};