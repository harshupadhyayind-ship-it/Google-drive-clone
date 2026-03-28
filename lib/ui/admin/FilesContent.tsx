"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Loader2, Search, Trash2, FileText } from "lucide-react";
import { Button } from "@/lib/ui/components/Button";
import { Input } from "@/lib/ui/components/Input";
import { useToast } from "@/lib/context/ToastContext";

type FileItem = {
  _id: string;
  name: string;
  size?: string;
  url: string;
  isTrashed: boolean;
  createdAt: string;
  userId?: { name: string; email: string } | null;
};

type Props = {
  initialFiles: FileItem[];
  initialTotal: number;
};

export const FilesContent = ({ initialFiles, initialTotal }: Props) => {
  const toast = useToast();
  const [files, setFiles] = useState<FileItem[]>(initialFiles);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialFiles.length < initialTotal);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [showTrashed, setShowTrashed] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const fetchFiles = useCallback(
    async (q: string, pg: number, trashed: boolean, reset: boolean) => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/admin/files?q=${encodeURIComponent(q)}&page=${pg}&trashed=${trashed}`
        );
        if (!res.ok) throw new Error();
        const data = await res.json();
        setFiles((prev) => (reset ? data.files : [...prev, ...data.files]));
        setTotal(data.total);
        setHasMore(data.hasMore);
      } catch {
        toast.error("Failed to load files");
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchInput]);

  useEffect(() => {
    if (page === 1) fetchFiles(search, 1, showTrashed, true);
  }, [search, showTrashed, fetchFiles]);

  const handleToggleTrashed = () => {
    setShowTrashed((prev) => !prev);
    setPage(1);
  };

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchFiles(search, nextPage, showTrashed, false);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, page, search, showTrashed, fetchFiles]);

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently delete this file? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/files/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setFiles((prev) => prev.filter((f) => f._id !== id));
      setTotal((t) => t - 1);
      toast.success("File deleted");
    } catch {
      toast.error("Failed to delete file");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-foreground">Files</h1>
        <span className="text-sm text-muted-foreground">{total} total</span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative max-w-sm flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search files..."
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
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">File Name</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Owner</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Size</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Uploaded</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {files.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No files found
                  </td>
                </tr>
              )}
              {files.map((file, i) => (
                <tr key={file._id ?? i} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline max-w-[200px]"
                    >
                      <FileText size={14} className="shrink-0" />
                      <span className="truncate">{file.name}</span>
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    {file.userId ? (
                      <div>
                        <p className="font-medium text-foreground">{file.userId.name}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[160px]">{file.userId.email}</p>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Unknown</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{file.size ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(file.createdAt).toLocaleDateString(undefined, {
                      year: "numeric", month: "short", day: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleDelete(file._id)}
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

        <div ref={sentinelRef} className="py-3 flex justify-center">
          {loading && <Loader2 size={18} className="animate-spin text-muted-foreground" />}
          {!hasMore && files.length > 0 && (
            <p className="text-xs text-muted-foreground">All files loaded</p>
          )}
        </div>
      </div>
    </div>
  );
};
