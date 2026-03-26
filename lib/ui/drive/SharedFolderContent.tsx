"use client";

import { Folder, FileText, ExternalLink, ArrowLeft } from "lucide-react";
import Link from "next/link";

type Props = {
  folderName: string;
  folders: any[];
  files: any[];
};

export const SharedFolderContent = ({ folderName, folders, files }: Props) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/shared-with-me"
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-yellow-100 text-yellow-600">
            <Folder size={18} />
          </div>
          <h1 className="text-2xl font-semibold">{folderName}</h1>
        </div>
      </div>

      {/* Folders */}
      {folders.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-medium text-gray-600">Folders</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {folders.map((f: any) => (
              <div
                key={f._id}
                className="flex items-center gap-3 p-3 rounded-xl border bg-white hover:shadow-sm transition-all"
              >
                <div className="p-2 rounded-lg bg-yellow-100 text-yellow-600 shrink-0">
                  <Folder size={18} />
                </div>
                <p className="text-sm font-medium text-gray-800 truncate">{f.name}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Files */}
      {files.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-medium text-gray-600">Files</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {files.map((f: any) => (
              <a
                key={f._id}
                href={f.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col gap-2 p-4 rounded-xl border bg-white hover:shadow-sm transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-600 shrink-0">
                    <FileText size={18} />
                  </div>
                  <ExternalLink size={14} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                </div>
                <p className="text-sm font-medium text-gray-800 truncate">{f.name}</p>
              </a>
            ))}
          </div>
        </section>
      )}

      {folders.length === 0 && files.length === 0 && (
        <p className="text-sm text-gray-400">This folder is empty</p>
      )}
    </div>
  );
};
