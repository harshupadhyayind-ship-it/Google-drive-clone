"use client";

import { useCallback } from "react";
import { Folder, FileText, Loader2 } from "lucide-react";
import Link from "next/link";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import { useDrive } from "@/lib/context/DriveContext";

type Item = {
  _id: string;
  name: string;
  type: "file" | "folder";
  lastAccessedAt: string;
  url?: string;
};

type Props = {
  initialItems: Item[];
};

export const RecentContent = ({ initialItems }: Props) => {
  const { user } = useDrive();

  const fetchFn = useCallback(async (page: number) => {
    const res = await fetch(`/api/recent?userId=${user?.id}&page=${page}`);
    if (!res.ok) throw new Error("Failed to load");
    const data = await res.json();
    return { items: data.items ?? [], hasMore: data.hasMore };
  }, [user?.id]);

  const { items, loading, hasMore, sentinelRef } = useInfiniteScroll({
    fetchFn,
    initialItems,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Recent</h1>

      {items.length === 0 && !loading ? (
        <p className="text-sm text-gray-400">No recent items</p>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item: Item, i: number) => {
            const href =
              item.type === "folder"
                ? `/?folderId=${item._id}`
                : item.url ?? "#";

            return (
              <Link
                key={item._id ?? i}
                href={href}
                target={item.type === "file" ? "_blank" : undefined}
              >
                <div className="flex items-center justify-between p-3 border rounded-xl bg-white hover:shadow-md transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${item.type === "folder" ? "bg-yellow-100 text-yellow-600" : "bg-blue-100 text-blue-600"}`}>
                      {item.type === "folder" ? <Folder size={18} /> : <FileText size={18} />}
                    </div>
                    <p className="text-sm font-medium text-gray-800">{item.name}</p>
                  </div>

                  <p className="text-xs text-gray-400">
                    {new Date(item.lastAccessedAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </Link>
            );
          })}

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
