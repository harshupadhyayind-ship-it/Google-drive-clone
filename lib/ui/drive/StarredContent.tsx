"use client";

import { useState } from "react";
import { Folder, FileText, Star } from "lucide-react";
import { Button } from "@/lib/ui/components/Button";

type Props = {
  initialFolders: any[];
  initialFiles: any[];
};

export const StarredContent = ({ initialFolders, initialFiles }: Props) => {
  const [folders, setFolders] = useState(initialFolders);
  const [files, setFiles] = useState(initialFiles);

  const handleUnstar = async (id: string, type: "file" | "folder") => {
    const endpoint = type === "file" ? `/api/file/${id}` : `/api/folder/${id}`;

    await fetch(endpoint, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isStarred: false }),
    });

    if (type === "file") {
      setFiles((prev) => prev.filter((f) => f._id !== id));
    } else {
      setFolders((prev) => prev.filter((f) => f._id !== id));
    }
  };

  const allItems = [
    ...folders.map((f) => ({ ...f, type: "folder" as const })),
    ...files.map((f) => ({ ...f, type: "file" as const })),
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Starred</h1>

      {allItems.length === 0 ? (
        <p className="text-sm text-gray-400">No starred items</p>
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

              <Button
                variant="ghost"
                size="sm"
                className="text-yellow-500 hover:text-yellow-600"
                onClick={() => handleUnstar(item._id, item.type)}
              >
                <Star size={15} className="mr-1 fill-yellow-400" />
                Unstar
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
