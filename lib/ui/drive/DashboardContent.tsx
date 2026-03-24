// lib/ui/drive/DashboardContent.tsx
"use client";

import { useDrive } from "@/lib/context/DriveContext";
import { FolderCard } from "./FolderCard";
import { FileCard } from "./FileCard";

export const DashboardContent = () => {
  const { folders, files } = useDrive();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">My Drive</h1>

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