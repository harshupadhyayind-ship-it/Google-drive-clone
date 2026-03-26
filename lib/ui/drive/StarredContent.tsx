"use client";

import { useCallback } from "react";
import { Folder, FileText, Star, Loader2 } from "lucide-react";
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

export const StarredContent = ({ initialFolders, initialFiles }: Props) => {
  const { user } = useDrive();
  const toast = useToast();

  const initialItems: Item[] = [
    ...initialFolders.map((f) => ({ _id: f._id, name: f.name, type: "folder" as const })),
    ...initialFiles.map((f) => ({ _id: f._id, name: f.name, type: "file" as const })),
  ];

  const fetchFn = useCallback(async (page: number) => {
    const res = await fetch(`/api/starred?userId=${user?.id}&page=${page}`);
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

  const handleUnstar = async (id: string, type: "file" | "folder") => {
    const endpoint = type === "file" ? `/api/file/${id}` : `/api/folder/${id}`;
    try {
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isStarred: false }),
      });
      if (!res.ok) throw new Error();
      setItems((prev) => prev.filter((f) => f._id !== id));
      toast.success("Removed from starred");
    } catch {
      toast.error("Failed to unstar item");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Starred</h1>

      {items.length === 0 && !loading ? (
        <p className="text-sm text-gray-400">No starred items</p>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item, i) => (
            <div
              key={item._id ?? i}
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

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="py-2 flex justify-center">
            {loading && <Loader2 size={18} className="animate-spin text-gray-400" />}
            {!hasMore && items.length > 0 && <p className="text-xs text-gray-400">No more items</p>}
          </div>
        </div>
      )}
    </div>
  );
};
