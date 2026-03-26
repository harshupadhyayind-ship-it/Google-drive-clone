"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Loader2, Search, Trash2, Folder } from "lucide-react";
import { Button } from "@/lib/ui/components/Button";
import { Input } from "@/lib/ui/components/Input";
import { useToast } from "@/lib/context/ToastContext";

type FolderItem = {
  _id: string;
  name: string;
  isTrashed: boolean;
  createdAt: string;
  userId?: { name: string; email: string } | null;
};

type Props = {
  initialFolders: FolderItem[];
  initialTotal: number;
};

export const FoldersContent = ({ initialFolders, initialTotal }: Props) => {
  const toast = useToast();
  const [folders, setFolders] = useState<FolderItem[]>(initialFolders);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialFolders.length < initialTotal);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [showTrashed, setShowTrashed] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const fetchFolders = useCallback(
    async (q: string, pg: number, trashed: boolean, reset: boolean) => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/admin/folders?q=${encodeURIComponent(q)}&page=${pg}&trashed=${trashed}`
        );
        if (!res.ok) throw new Error();
        const data = await res.json();
        setFolders((prev) => (reset ? data.folders : [...prev, ...data.folders]));
        setTotal(data.total);
        setHasMore(data.hasMore);
      } catch {
        toast.error("Failed to load folders");
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchInput]);

  useEffect(() => {
    if (page === 1) {
      fetchFolders(search, 1, showTrashed, true);
    }
  }, [search, showTrashed, fetchFolders]);

  const handleToggleTrashed = () => {
    setShowTrashed((prev) => !prev);
    setPage(1);
  };

  // Infinite scroll
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchFolders(search, nextPage, showTrashed, false);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, page, search, showTrashed, fetchFolders]);

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently delete this folder and all its subfolders? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/folders/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setFolders((prev) => prev.filter((f) => f._id !== id));
      setTotal((t) => t - 1);
      toast.success(`Folder deleted (${data.deleted} total removed)`);
    } catch {
      toast.error("Failed to delete folder");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Folders</h1>
        <span className="text-sm text-gray-500">{total} total</span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative max-w-sm flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search folders..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant={showTrashed ? "default" : "outline"}
          size="sm"
          onClick={handleToggleTrashed}
        >
          <Trash2 size={14} className="mr-1" />
          {showTrashed ? "Showing Trashed" : "Show Trashed"}
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Folder Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Owner</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Created</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {folders.length === 0 && !loading && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-400">
                    No folders found
                  </td>
                </tr>
              )}
              {folders.map((folder, i) => (
                <tr key={folder._id ?? i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-gray-800">
                      <div className="p-1.5 rounded-lg bg-yellow-100 text-yellow-600 shrink-0">
                        <Folder size={14} />
                      </div>
                      <span className="font-medium truncate max-w-[200px]">{folder.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {folder.userId ? (
                      <div>
                        <p className="font-medium text-gray-700">{folder.userId.name}</p>
                        <p className="text-xs text-gray-400 truncate max-w-[160px]">{folder.userId.email}</p>
                      </div>
                    ) : (
                      <span className="text-gray-400">Unknown</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(folder.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleDelete(folder._id)}
                      >
                        <Trash2 size={14} className="mr-1" />
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} className="py-3 flex justify-center">
          {loading && <Loader2 size={18} className="animate-spin text-gray-400" />}
          {!hasMore && folders.length > 0 && (
            <p className="text-xs text-gray-400">All folders loaded</p>
          )}
        </div>
      </div>
    </div>
  );
};
