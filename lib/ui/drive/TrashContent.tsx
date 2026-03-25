"use client";

import { useState } from "react";
import { Folder, FileText, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/lib/ui/components/Button";

type Item = {
  _id: string;
  name: string;
  type: "file" | "folder";
};

type Props = {
  initialFolders: any[];
  initialFiles: any[];
};

export const TrashContent = ({ initialFolders, initialFiles }: Props) => {
  const [folders, setFolders] = useState(initialFolders);
  const [files, setFiles] = useState(initialFiles);

  const handleRestore = async (id: string, type: "file" | "folder") => {
    const endpoint = type === "file" ? `/api/file/${id}` : `/api/folder/${id}`;

    await fetch(endpoint, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isTrashed: false }),
    });

    if (type === "file") {
      setFiles((prev) => prev.filter((f) => f._id !== id));
    } else {
      setFolders((prev) => prev.filter((f) => f._id !== id));
    }
  };

  const handleDeletePermanently = async (id: string, type: "file" | "folder") => {
    const endpoint = type === "file" ? `/api/file/${id}` : `/api/folder/${id}`;

    await fetch(endpoint, { method: "DELETE" });

    if (type === "file") {
      setFiles((prev) => prev.filter((f) => f._id !== id));
    } else {
      setFolders((prev) => prev.filter((f) => f._id !== id));
    }
  };

  const allItems: Item[] = [
    ...folders.map((f) => ({ _id: f._id, name: f.name, type: "folder" as const })),
    ...files.map((f) => ({ _id: f._id, name: f.name, type: "file" as const })),
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Trash</h1>

      {allItems.length === 0 ? (
        <p className="text-sm text-gray-400">Trash is empty</p>
      ) : (
        <div className="flex flex-col gap-2">
          {allItems.map((item) => (
            <div
              key={item._id}
              className="flex items-center justify-between p-3 border rounded-xl bg-white"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${item.type === "folder" ? "bg-yellow-100 text-yellow-600" : "bg-blue-100 text-blue-600"}`}>
                  {item.type === "folder" ? <Folder size={18} /> : <FileText size={18} />}
                </div>
                <p className="text-sm font-medium text-gray-800">{item.name}</p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRestore(item._id, item.type)}
                >
                  <RotateCcw size={15} className="mr-1" />
                  Restore
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-600"
                  onClick={() => handleDeletePermanently(item._id, item.type)}
                >
                  <Trash2 size={15} className="mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
