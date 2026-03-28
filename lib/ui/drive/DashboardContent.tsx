// lib/ui/drive/DashboardContent.tsx
"use client";

import { useDrive } from "@/lib/context/DriveContext";
import { useToast } from "@/lib/context/ToastContext";
import { FolderCard } from "./FolderCard";
import { FileCard } from "./FileCard";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { InputDialog } from "@/lib/ui/components/InputDialog";
import { ShareDialog } from "./ShareDialog";
import { MoveDialog } from "./MoveDialog";
import { FilePreviewModal, PreviewFile } from "./FilePreviewModal";
import { Star, Trash2, X, SquareCheckBig, LayoutGrid, List } from "lucide-react";
import { Button } from "@/lib/ui/components/Button";
import { DriveBreadcrumb } from "./DriveBreadcrumb";

type RenameTarget  = { id: string; name: string; type: "file" | "folder" };
type ShareTarget   = { id: string; name: string; type: "file" | "folder" };
type MoveTarget    = { id: string; name: string; type: "file" | "folder" };
type PreviewTarget = PreviewFile;
type SelectedItem  = { id: string; type: "file" | "folder" };

export const DashboardContent = () => {
  const searchParams = useSearchParams();
  const { folders, files, setFolders, setFiles, refreshDriveData, currentFolderId, isSyncing } =
    useDrive();

  const parentId = searchParams.get("folderId") ?? null;
  const toast = useToast();

  // ── View mode (grid / list) ────────────────────────────────────────
  const [viewMode, setViewMode] = useState<"grid" | "list">(() => {
    if (typeof window === "undefined") return "grid";
    return (localStorage.getItem("vegadrive-view-mode") as "grid" | "list") ?? "grid";
  });

  // ── Single-item actions ────────────────────────────────────────────
  const [renameTarget, setRenameTarget] = useState<RenameTarget | null>(null);
  const [renameName,   setRenameName]   = useState("");
  const [shareTarget,   setShareTarget]   = useState<ShareTarget   | null>(null);
  const [moveTarget,    setMoveTarget]    = useState<MoveTarget    | null>(null);
  const [previewTarget, setPreviewTarget] = useState<PreviewTarget | null>(null);

  // ── Multi-select state ─────────────────────────────────────────────
  const [selected, setSelected] = useState<SelectedItem[]>([]);
  const selectionMode = selected.length > 0;

  // Clear selection whenever the folder changes
  useEffect(() => {
    setSelected([]);
  }, [parentId]);

  useEffect(() => {
    if (parentId === currentFolderId) return;
    refreshDriveData(parentId);
  }, [parentId, currentFolderId, refreshDriveData]);

  // ── Selection helpers ──────────────────────────────────────────────
  const toggleSelect = useCallback((id: string, type: "file" | "folder") => {
    setSelected((prev) => {
      const exists = prev.find((s) => s.id === id);
      return exists ? prev.filter((s) => s.id !== id) : [...prev, { id, type }];
    });
  }, []);

  const isSelected = (id: string) => selected.some((s) => s.id === id);

  const selectAll = () => {
    const allFolders: SelectedItem[] = folders.map((f: any) => ({ id: f._id, type: "folder" as const }));
    const allFiles:   SelectedItem[] = files.map((f: any)   => ({ id: f._id, type: "file"   as const }));
    setSelected([...allFolders, ...allFiles]);
  };

  const clearSelection = () => setSelected([]);

  // ── Single-item handlers ───────────────────────────────────────────
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
        setFiles((prev: any[]) => prev.map((f) => (f._id === id ? { ...f, name: updated?.name } : f)));
      } else {
        setFolders((prev: any[]) => prev.map((f) => (f._id === id ? { ...f, name: updated?.name } : f)));
      }
      toast.success("Renamed successfully");
    } catch {
      toast.error("Failed to rename");
    }
    setRenameTarget(null);
  };

  const handleStar = async (id: string, type: "file" | "folder", isStarredVal: boolean) => {
    const endpoint = type === "file" ? `/api/file/${id}` : `/api/folder/${id}`;
    try {
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isStarred: isStarredVal }),
      });
      if (!res.ok) throw new Error();
      if (type === "file") {
        setFiles((prev: any[]) => prev.map((f) => (f._id === id ? { ...f, isStarred: isStarredVal } : f)));
      } else {
        setFolders((prev: any[]) => prev.map((f) => (f._id === id ? { ...f, isStarred: isStarredVal } : f)));
      }
      toast.success(isStarredVal ? "Added to starred" : "Removed from starred");
    } catch {
      toast.error("Failed to update starred");
    }
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
        setFiles((prev: any[]) => prev.filter((f) => f._id !== id));
      } else {
        setFolders((prev: any[]) => prev.filter((f) => f._id !== id));
      }
      toast.success("Moved to trash");
    } catch {
      toast.error("Failed to move to trash");
    }
  };

  const handleCreateCopy = async (id: string) => {
    try {
      const res = await fetch(`/api/file/${id}/copy`, { method: "POST" });
      if (!res.ok) throw new Error();
      const copy = await res.json();
      // Insert the copy right after the original in the list
      setFiles((prev: any[]) => {
        const idx = prev.findIndex((f) => f._id === id);
        const next = [...prev];
        next.splice(idx + 1, 0, copy);
        return next;
      });
      toast.success("Copy created");
    } catch {
      toast.error("Failed to create copy");
    }
  };

  const handleDownload = (url: string, name: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.target = "_blank";
    a.click();
  };

  const handleMove = async (targetFolderId: string | null) => {
    if (!moveTarget) return;
    const { id, type } = moveTarget;
    const endpoint = type === "file" ? `/api/file/${id}` : `/api/folder/${id}`;
    const body     = type === "file" ? { folderId: targetFolderId } : { parentId: targetFolderId };

    try {
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      // Remove from current view — it now lives in a different folder
      if (type === "file") {
        setFiles((prev: any[]) => prev.filter((f) => f._id !== id));
      } else {
        setFolders((prev: any[]) => prev.filter((f) => f._id !== id));
      }
      toast.success("Moved successfully");
    } catch {
      toast.error("Failed to move");
    }
  };

  // ── Bulk action handlers ───────────────────────────────────────────
  const handleBulkStar = async (starValue: boolean) => {
    const results = await Promise.allSettled(
      selected.map(({ id, type }) =>
        fetch(type === "file" ? `/api/file/${id}` : `/api/folder/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isStarred: starValue }),
        })
      )
    );

    const succeeded = selected.filter((_, i) => results[i].status === "fulfilled");
    const fileIds   = new Set(succeeded.filter((s) => s.type === "file").map((s) => s.id));
    const folderIds = new Set(succeeded.filter((s) => s.type === "folder").map((s) => s.id));

    if (fileIds.size)   setFiles((prev: any[]) => prev.map((f) => fileIds.has(f._id) ? { ...f, isStarred: starValue } : f));
    if (folderIds.size) setFolders((prev: any[]) => prev.map((f) => folderIds.has(f._id) ? { ...f, isStarred: starValue } : f));

    const failed = results.filter((r) => r.status === "rejected").length;
    toast.success(`${succeeded.length} item${succeeded.length !== 1 ? "s" : ""} ${starValue ? "starred" : "unstarred"}${failed ? ` (${failed} failed)` : ""}`);
    clearSelection();
  };

  const handleBulkTrash = async () => {
    const results = await Promise.allSettled(
      selected.map(({ id, type }) =>
        fetch(type === "file" ? `/api/file/${id}` : `/api/folder/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isTrashed: true }),
        })
      )
    );

    const succeeded = selected.filter((_, i) => results[i].status === "fulfilled");
    const fileIds   = new Set(succeeded.filter((s) => s.type === "file").map((s) => s.id));
    const folderIds = new Set(succeeded.filter((s) => s.type === "folder").map((s) => s.id));

    if (fileIds.size)   setFiles((prev: any[]) => prev.filter((f) => !fileIds.has(f._id)));
    if (folderIds.size) setFolders((prev: any[]) => prev.filter((f) => !folderIds.has(f._id)));

    const failed = results.filter((r) => r.status === "rejected").length;
    toast.success(`${succeeded.length} item${succeeded.length !== 1 ? "s" : ""} moved to trash${failed ? ` (${failed} failed)` : ""}`);
    clearSelection();
  };

  const totalItems = folders.length + files.length;
  const allSelected = selected.length === totalItems && totalItems > 0;
  const someStarred = selected.some(({ id, type }) => {
    if (type === "file")   return files.find((f: any) => f._id === id)?.isStarred;
    if (type === "folder") return folders.find((f: any) => f._id === id)?.isStarred;
    return false;
  });

  return (
    <div className="space-y-6 pb-24">
      {/* Header row */}
      <div className="flex items-center justify-between gap-3">
        <DriveBreadcrumb folderId={parentId} />

        <div className="flex items-center gap-2 shrink-0">
          {selectionMode && (
            <button
              onClick={allSelected ? clearSelection : selectAll}
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
            >
              {allSelected ? "Deselect all" : "Select all"}
            </button>
          )}

          {/* View toggle */}
          <div className="flex items-center border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => { setViewMode("grid"); localStorage.setItem("vegadrive-view-mode", "grid"); }}
              title="Grid view"
              className={`p-1.5 transition-colors ${
                viewMode === "grid"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => { setViewMode("list"); localStorage.setItem("vegadrive-view-mode", "list"); }}
              title="List view"
              className={`p-1.5 transition-colors ${
                viewMode === "list"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {isSyncing && (
        <p className="text-sm text-muted-foreground" aria-live="polite">
          Loading folder contents...
        </p>
      )}

      {/* Folders section */}
      <section>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Folders</h2>
        <div className={`grid gap-3 ${viewMode === "grid" ? "grid-cols-2 md:grid-cols-4" : "grid-cols-1"}`}>
          {folders.length === 0 && (
            <p className="text-sm text-muted-foreground col-span-full">No folders</p>
          )}
          {folders.map((folder: any, i: number) => (
            <FolderCard
              key={folder._id ?? i}
              name={folder.name}
              href={`/?folderId=${folder._id}`}
              viewMode={viewMode}
              isStarred={folder.isStarred}
              isSelected={isSelected(folder._id)}
              selectionMode={selectionMode}
              onSelect={() => toggleSelect(folder._id, "folder")}
              onRename={() => openRename(folder._id, folder.name, "folder")}
              onStar={() => handleStar(folder._id, "folder", !folder.isStarred)}
              onShare={() => setShareTarget({ id: folder._id, name: folder.name, type: "folder" })}
              onMoveTo={() => setMoveTarget({ id: folder._id, name: folder.name, type: "folder" })}
              onMoveToTrash={() => handleMoveToTrash(folder._id, "folder")}
            />
          ))}
        </div>
      </section>

      {/* Files section */}
      <section>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Files</h2>
        <div className={`grid gap-3 ${viewMode === "grid" ? "grid-cols-2 md:grid-cols-4" : "grid-cols-1"}`}>
          {files.length === 0 && (
            <p className="text-sm text-muted-foreground col-span-full">No files</p>
          )}
          {files.map((file: any, i: number) => (
            <FileCard
              key={file._id ?? i}
              id={file._id}
              name={file.name}
              href={file.url}
              viewMode={viewMode}
              isStarred={file.isStarred}
              isSelected={isSelected(file._id)}
              selectionMode={selectionMode}
              onSelect={() => toggleSelect(file._id, "file")}
              onRename={() => openRename(file._id, file.name, "file")}
              onStar={() => handleStar(file._id, "file", !file.isStarred)}
              onShare={() => setShareTarget({ id: file._id, name: file.name, type: "file" })}
              onDownload={() => handleDownload(file.url, file.name)}
              onMoveTo={() => setMoveTarget({ id: file._id, name: file.name, type: "file" })}
              onCreateCopy={() => handleCreateCopy(file._id)}
              onMoveToTrash={() => handleMoveToTrash(file._id, "file")}
              onPreview={() => setPreviewTarget({ name: file.name, url: file.url })}
            />
          ))}
        </div>
      </section>

      {/* ── Bulk Action Bar ────────────────────────────────────────── */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300
          ${selectionMode ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"}`}
      >
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-border bg-card/95 backdrop-blur-md shadow-2xl shadow-black/30">
          {/* Count badge */}
          <div className="flex items-center gap-1.5 pr-3 border-r border-border">
            <SquareCheckBig size={15} className="text-primary" />
            <span className="text-sm font-semibold text-foreground tabular-nums">
              {selected.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {selected.length === 1 ? "item" : "items"} selected
            </span>
          </div>

          {/* Star / Unstar */}
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10"
            onClick={() => handleBulkStar(!someStarred)}
          >
            <Star size={15} className={someStarred ? "fill-yellow-400" : ""} />
            {someStarred ? "Unstar" : "Star"}
          </Button>

          {/* Move to Trash */}
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleBulkTrash}
          >
            <Trash2 size={15} />
            Move to Trash
          </Button>

          {/* Divider + clear */}
          <div className="w-px h-5 bg-border mx-1" />
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 text-muted-foreground hover:text-foreground"
            onClick={clearSelection}
            title="Clear selection"
          >
            <X size={15} />
          </Button>
        </div>
      </div>

      {/* Single-item dialogs */}
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

      {moveTarget && (
        <MoveDialog
          open={!!moveTarget}
          onOpenChange={(open) => !open && setMoveTarget(null)}
          itemId={moveTarget.id}
          itemName={moveTarget.name}
          itemType={moveTarget.type}
          currentFolderId={parentId}
          onMove={handleMove}
        />
      )}

      <FilePreviewModal
        open={!!previewTarget}
        onClose={() => setPreviewTarget(null)}
        file={previewTarget}
        allFiles={files.map((f: any) => ({ name: f.name, url: f.url }))}
        onNavigate={(f) => setPreviewTarget(f)}
      />
    </div>
  );
};
