"use client";

import { Folder, FileText } from "lucide-react";
import Link from "next/link";

type Item = {
  _id: string;
  name: string;
  type: "file" | "folder";
  lastAccessedAt: string;
  url?: string;
};

type Props = {
  items: Item[];
};

export const RecentContent = ({ items }: Props) => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Recent</h1>

      {items.length === 0 ? (
        <p className="text-sm text-gray-400">No recent items</p>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => {
            const href =
              item.type === "folder"
                ? `/dashboard?folderId=${item._id}`
                : item.url ?? "#";

            return (
              <Link
                key={item._id}
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
        </div>
      )}
    </div>
  );
};
