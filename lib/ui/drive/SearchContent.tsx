"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useDrive } from "@/lib/context/DriveContext";
import { useToast } from "@/lib/context/ToastContext";
import { FolderCard } from "./FolderCard";
import { FileCard } from "./FileCard";
import { InputDialog } from "@/lib/ui/components/InputDialog";
import { ShareDialog } from "./ShareDialog";

type RenameTarget = { id: string; name: string; type: "file" | "folder" };
type ShareTarget = { id: string; name: string; type: "file" | "folder" };

export const SearchContent = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const { user } = useDrive();
  const toast = useToast();

  const [folders, setFolders] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [renameTarget, setRenameTarget] = useState<RenameTarget | null>(null);
  const [renameName, setRenameName] = useState("");
  const [shareTarget, setShareTarget] = useState<ShareTarget | null>(null);

  useEffect(() => {
    if (!query || !user?.id) return;

    setLoading(true);
    fetch(`/api/search?userId=${user.id}&q=${encodeURIComponent(query)}`)
      .then((r) => {
        if (!r.ok) throw new Error("Search failed");
        return r.json();
      })
      .then((data) => {
        setFolders(data.folders ?? []);
        setFiles(data.files ?? []);
      })
      .catch(() => toast.error("Search failed"))
      .finally(() => setLoading(false));
  }, [query, user?.id]);

  const openRename = (id: string, name: string, type: "file" | "folder") => {
    setRenameTarget({ id, name, type });
    setRenameName(name);
  };

  const handleRename = async () => {
    if (!renameTarget || !renameName.trim()) return;
    const { id, type } = renameTarget;
    const endpoint = type === "file" ? `/api/file/${id}` : `/api/folder/${id}`;
    try {
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: renameName.trim() }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      if (type === "file") {
        setFiles((prev) => prev.map((f) => (f._id === id ? { ...f, name: updated.name } : f)));
      } else {
        setFolders((prev) => prev.map((f) => (f._id === id ? { ...f, name: updated.name } : f)));
      }
      toast.success("Renamed successfully");
    } catch {
      toast.error("Failed to rename");
    }
    setRenameTarget(null);
  };

  const handleMoveToTrash = async (id: string, type: "file" | "folder") => {
    const endpoint = type === "file" ? `/api/file/${id}` : `/api/folder/${id}`;
    try {
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isTrashed: true }),
      });
      if (!res.ok) throw new Error();
      if (type === "file") {
        setFiles((prev) => prev.filter((f) => f._id !== id));
      } else {
        setFolders((prev) => prev.filter((f) => f._id !== id));
      }
      toast.success("Moved to trash");
    } catch {
      toast.error("Failed to move to trash");
    }
  };

  const handleStar = async (id: string, type: "file" | "folder", isStarred: boolean) => {
    const endpoint = type === "file" ? `/api/file/${id}` : `/api/folder/${id}`;
    try {
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isStarred }),
      });
      if (!res.ok) throw new Error();
      if (type === "file") {
        setFiles((prev) => prev.map((f) => (f._id === id ? { ...f, isStarred } : f)));
      } else {
        setFolders((prev) => prev.map((f) => (f._id === id ? { ...f, isStarred } : f)));
      }
      toast.success(isStarred ? "Added to starred" : "Removed from starred");
    } catch {
      toast.error("Failed to update starred");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">
        Results for <span className="text-blue-600">&ldquo;{query}&rdquo;</span>
      </h1>

      {loading && <p className="text-sm text-gray-500">Searching...</p>}

      {!loading && folders.length === 0 && files.length === 0 && query && (
        <p className="text-sm text-gray-400">No results found</p>
      )}

      {!loading && folders.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-medium text-gray-600">Folders</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {folders.map((folder: any) => (
              <FolderCard
                key={folder._id}
                name={folder.name}
                href={`/dashboard?folderId=${folder._id}`}
                isStarred={folder.isStarred}
                onRename={() => openRename(folder._id, folder.name, "folder")}
                onStar={() => handleStar(folder._id, "folder", !folder.isStarred)}
                onShare={() => setShareTarget({ id: folder._id, name: folder.name, type: "folder" })}
                onMoveToTrash={() => handleMoveToTrash(folder._id, "folder")}
              />
            ))}
          </div>
        </section>
      )}

      {!loading && files.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-medium text-gray-600">Files</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {files.map((file: any) => (
              <FileCard
                key={file._id}
                id={file._id}
                name={file.name}
                href={file.url}
                isStarred={file.isStarred}
                onRename={() => openRename(file._id, file.name, "file")}
                onStar={() => handleStar(file._id, "file", !file.isStarred)}
                onShare={() => setShareTarget({ id: file._id, name: file.name, type: "file" })}
                onMoveToTrash={() => handleMoveToTrash(file._id, "file")}
              />
            ))}
          </div>
        </section>
      )}

      <InputDialog
        open={!!renameTarget}
        onOpenChange={(open) => !open && setRenameTarget(null)}
        title={`Rename ${renameTarget?.type === "file" ? "File" : "Folder"}`}
        value={renameName}
        onChange={setRenameName}
        onConfirm={handleRename}
        confirmLabel="Rename"
      />

      {shareTarget && (
        <ShareDialog
          open={!!shareTarget}
          onOpenChange={(open) => !open && setShareTarget(null)}
          itemId={shareTarget.id}
          itemType={shareTarget.type}
          itemName={shareTarget.name}
        />
      )}
    </div>
  );
};
