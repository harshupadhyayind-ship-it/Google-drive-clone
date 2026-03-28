"use client";

import { useState, useCallback } from "react";
import { Folder, FileText, RotateCcw, Trash2, Loader2 } from "lucide-react";
import { DriveBreadcrumb } from "./DriveBreadcrumb";
import { Button } from "@/lib/ui/components/Button";
import { useToast } from "@/lib/context/ToastContext";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import { useDrive } from "@/lib/context/DriveContext";

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
  const { user } = useDrive();
  const toast = useToast();

  const initialItems: Item[] = [
    ...initialFolders.map((f) => ({ _id: f._id, name: f.name, type: "folder" as const })),
    ...initialFiles.map((f) => ({ _id: f._id, name: f.name, type: "file" as const })),
  ];

  const fetchFn = useCallback(async (page: number) => {
    const res = await fetch(`/api/trash?userId=${user?.id}&page=${page}`);
    if (!res.ok) throw new Error("Failed to load");
    const data = await res.json();
    const items: Item[] = [
      ...(data.folders ?? []).map((f: any) => ({ _id: f._id, name: f.name, type: "folder" as const })),
      ...(data.files ?? []).map((f: any) => ({ _id: f._id, name: f.name, type: "file" as const })),
    ];
    return { items, hasMore: data.hasMore };
  }, [user?.id]);

  const { items, setItems, loading, hasMore, sentinelRef } = useInfiniteScroll({
    fetchFn,
    initialItems,
  });

  const handleRestore = async (id: string, type: "file" | "folder") => {
    const endpoint = type === "file" ? `/api/file/${id}` : `/api/folder/${id}`;
    try {
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isTrashed: false }),
      });
      if (!res.ok) throw new Error();
      setItems((prev) => prev.filter((f) => f._id !== id));
      toast.success("Restored successfully");
    } catch {
      toast.error("Failed to restore item");
    }
  };

  const handleDeletePermanently = async (id: string, type: "file" | "folder") => {
    const endpoint = type === "file" ? `/api/file/${id}` : `/api/folder/${id}`;
    try {
      const res = await fetch(endpoint, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setItems((prev) => prev.filter((f) => f._id !== id));
      toast.success("Deleted permanently");
    } catch {
      toast.error("Failed to delete item");
    }
  };

  return (
    <div className="space-y-6">
      <DriveBreadcrumb staticLabel="Trash" />

      {items.length === 0 && !loading ? (
        <p className="text-sm text-muted-foreground/60">Trash is empty</p>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item, i) => (
            <div
              key={item._id ?? i}
              className="flex items-center justify-between p-3 border border-border rounded-xl bg-card"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${item.type === "folder" ? "bg-yellow-500/15 text-yellow-500" : "bg-primary/15 text-primary"}`}>
                  {item.type === "folder" ? <Folder size={18} /> : <FileText size={18} />}
                </div>
                <p className="text-sm font-medium text-foreground">{item.name}</p>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => handleRestore(item._id, item.type)}>
                  <RotateCcw size={15} className="mr-1" />
                  Restore
                </Button>
                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600" onClick={() => handleDeletePermanently(item._id, item.type)}>
                  <Trash2 size={15} className="mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          ))}

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="py-2 flex justify-center">
            {loading && <Loader2 size={18} className="animate-spin text-muted-foreground/60" />}
            {!hasMore && items.length > 0 && <p className="text-xs text-muted-foreground/60">No more items</p>}
          </div>
        </div>
      )}
    </div>
  );
};
