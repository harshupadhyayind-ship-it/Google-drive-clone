// lib/ui/drive/DashboardContent.tsx
"use client";

import { useDrive } from "@/lib/context/DriveContext";
import { FolderCard } from "./FolderCard";
import { FileCard } from "./FileCard";

export const DashboardContent = () => {
  const { folders, files } = useDrive();

  console.log({folders, files})

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
            <a
              key={folder._id}
              href={`/dashboard?folderId=${folder._id}`}
            >
              <FolderCard name={folder.name} />
            </a>
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
            <a key={file._id} href={file.url} target="_blank">
              <FileCard name={file.name} />
            </a>
          ))}
        </div>
      </section>
    </div>
  );
};