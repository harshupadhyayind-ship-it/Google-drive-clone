"use client";

import { useState, useEffect } from "react";
import { Folder, FileText, ExternalLink, Loader2 } from "lucide-react";
import { DriveBreadcrumb } from "./DriveBreadcrumb";
import Link from "next/link";

type ShareItem = {
  _id: string;          // Share document _id
  itemId: string;       // actual file / folder _id
  itemType: "file" | "folder";
  itemName: string;
  url?: string;
  createdAt: string;
  ownerId?: { name: string; email: string } | null;
};

export const SharedWithMeContent = () => {
  const [items, setItems] = useState<ShareItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/share/with-me")
      .then((r) => r.json())
      .then((data) => setItems(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <DriveBreadcrumb staticLabel="Shared with me" />

      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground/60">
          <Loader2 size={16} className="animate-spin" />
          Loading...
        </div>
      )}

      {!loading && items.length === 0 && (
        <p className="text-sm text-muted-foreground/60">Nothing shared with you yet</p>
      )}

      {!loading && items.length > 0 && (
        <div className="flex flex-col gap-2">
          {items.map((item) => {
            const href = item.itemType === "folder"
              ? `/shared-folder/${item.itemId}`
              : item.url ?? "#";

            return (
              <div
                key={item._id}
                className="flex items-center justify-between p-3 border border-border rounded-xl bg-card hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2 rounded-lg shrink-0 ${item.itemType === "folder" ? "bg-yellow-500/15 text-yellow-500" : "bg-primary/15 text-primary"}`}>
                    {item.itemType === "folder" ? <Folder size={18} /> : <FileText size={18} />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.itemName}</p>
                    <p className="text-xs text-muted-foreground/60">
                      Shared by {item.ownerId?.name ?? "Unknown"} ·{" "}
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <Link
                  href={href}
                  target={item.itemType === "file" ? "_blank" : undefined}
                  className="shrink-0 ml-3 p-2 text-muted-foreground/60 hover:text-primary transition-colors"
                >
                  <ExternalLink size={16} />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
