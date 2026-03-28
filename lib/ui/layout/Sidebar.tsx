"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  HardDrive,
  Clock,
  Star,
  Trash2,
  Upload,
  FolderPlus,
  Plus,
  X,
  Users,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { Button } from "../components/Button";
import { useDrive } from "@/lib/context/DriveContext";
import { useSearchParams } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/lib/ui/components/Menu/dropdown-menu";

import { InputDialog } from "@/lib/ui/components/InputDialog";

const navItems = [
  { name: "My Drive",       path: "/dashboard",               icon: HardDrive },
  { name: "Shared with me", path: "/dashboard/shared-with-me", icon: Users    },
  { name: "Recent",         path: "/dashboard/recent",         icon: Clock    },
  { name: "Starred",        path: "/dashboard/starred",        icon: Star     },
  { name: "Trash",          path: "/dashboard/trash",          icon: Trash2   },
];

type UploadItem = {
  id: string;
  name: string;
  status: "uploading" | "done" | "error";
};

type Props = {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
};

export const Sidebar = ({ userId, isOpen, onClose }: Props) => {
  const pathname    = usePathname();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { setFiles, user, setFolders } = useDrive();
  const currentFolderId = searchParams.get("folderId");

  const [open,       setOpen]       = useState(false);
  const [folderName, setFolderName] = useState("");
  const [storage,    setStorage]    = useState({ usedMB: 0, totalMB: 100, percent: 0 });

  // Upload progress panel
  const [uploads,       setUploads]       = useState<UploadItem[]>([]);
  const [panelMinimised, setPanelMinimised] = useState(false);

  useEffect(() => {
    fetch("/api/storage")
      .then((r) => r.json())
      .then((d) => { if (d.usedMB !== undefined) setStorage(d); })
      .catch(() => {});
  }, []);

  // Auto-dismiss panel 3 s after everything finishes
  useEffect(() => {
    if (uploads.length === 0) return;
    const allDone = uploads.every((u) => u.status !== "uploading");
    if (!allDone) return;
    const t = setTimeout(() => setUploads([]), 3000);
    return () => clearTimeout(t);
  }, [uploads]);

  const uploadSingleFile = async (file: File, uid: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", user.id);
    formData.append("folderId", currentFolderId || "");

    try {
      const res = await fetch("/api/file", { method: "POST", body: formData });
      if (!res.ok) throw new Error();
      const saved = await res.json();
      setFiles((prev: any) => [saved, ...prev]);
      setUploads((prev) =>
        prev.map((u) => (u.id === uid ? { ...u, status: "done" } : u))
      );
    } catch {
      setUploads((prev) =>
        prev.map((u) => (u.id === uid ? { ...u, status: "error" } : u))
      );
    }
  };

  const handleFilesSelected = async (fileList: FileList) => {
    const files = Array.from(fileList);
    if (files.length === 0) return;

    // Build upload queue entries
    const queue: UploadItem[] = files.map((f) => ({
      id: `${Date.now()}-${Math.random()}`,
      name: f.name,
      status: "uploading",
    }));

    setUploads((prev) => [...prev, ...queue]);
    setPanelMinimised(false);

    // Upload all files in parallel
    await Promise.all(files.map((f, i) => uploadSingleFile(f, queue[i].id)));

    // Reset input so the same file can be re-selected later
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCreateFolder = async () => {
    if (!folderName.trim()) return;

    const res = await fetch("/api/folder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: folderName.trim(), parentId: currentFolderId, userId }),
    });

    const saved = await res.json();
    setFolders((prev: any) => [saved, ...prev]);
    setFolderName("");
    setOpen(false);
  };

  const asideClass = isOpen
    ? "fixed inset-y-0 left-0 z-50 flex flex-col w-64 h-full bg-sidebar border-r border-sidebar-border p-4"
    : "hidden md:flex md:flex-col md:w-64 h-full bg-sidebar border-r border-sidebar-border p-4";

  const doneCount      = uploads.filter((u) => u.status === "done").length;
  const errorCount     = uploads.filter((u) => u.status === "error").length;
  const uploadingCount = uploads.filter((u) => u.status === "uploading").length;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={onClose} />
      )}

      <aside className={asideClass}>
        {/* Logo + close */}
        <div className="flex items-center justify-between mb-6 px-2">
          <Link href="/dashboard">
            <Image src="/logo.svg" alt="NovaDrive" width={130} height={32} priority />
          </Link>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={onClose}>
            <X size={18} />
          </Button>
        </div>

        {/* New button */}
        <div className="mb-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="w-full flex items-center gap-2">
                <Plus size={16} />
                New
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-48">
              <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                <Upload size={16} className="mr-2" />
                Upload Files
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setOpen(true)}>
                <FolderPlus size={16} className="mr-2" />
                New Folder
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Hidden multi-file input */}
          <input
            type="file"
            multiple
            ref={fileInputRef}
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFilesSelected(e.target.files);
              }
            }}
          />
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                  isActive
                    ? "bg-primary/15 text-primary font-medium border border-primary/20"
                    : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                }`}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Storage */}
        <div className="mt-auto pt-6">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-muted-foreground">Storage</p>
            <p className="text-xs text-muted-foreground">{storage.percent}%</p>
          </div>
          <div className="w-full bg-sidebar-accent h-2 rounded-full overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all ${
                storage.percent >= 90
                  ? "bg-red-500"
                  : storage.percent >= 70
                  ? "bg-yellow-500"
                  : "bg-gradient-to-r from-purple-500 to-blue-500"
              }`}
              style={{ width: `${storage.percent}%` }}
            />
          </div>
          <p className="text-xs mt-1 text-muted-foreground">
            {storage.usedMB} MB of {storage.totalMB} MB used
          </p>
        </div>

        <InputDialog
          open={open}
          onOpenChange={setOpen}
          title="New Folder"
          placeholder="Enter folder name"
          value={folderName}
          onChange={setFolderName}
          onConfirm={handleCreateFolder}
          confirmLabel="Create"
        />
      </aside>

      {/* ── Upload progress panel (fixed, bottom-right) ─────────── */}
      {uploads.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 w-72 rounded-xl border border-border bg-card shadow-2xl shadow-black/30 overflow-hidden">
          {/* Panel header */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-muted/40 border-b border-border">
            <span className="text-sm font-medium text-foreground">
              {uploadingCount > 0
                ? `Uploading ${uploadingCount} file${uploadingCount !== 1 ? "s" : ""}…`
                : errorCount > 0
                ? `${doneCount} uploaded, ${errorCount} failed`
                : `${doneCount} file${doneCount !== 1 ? "s" : ""} uploaded`}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPanelMinimised((p) => !p)}
                className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                aria-label={panelMinimised ? "Expand" : "Minimise"}
              >
                <ChevronDown
                  size={14}
                  className={`transition-transform ${panelMinimised ? "rotate-180" : ""}`}
                />
              </button>
              <button
                onClick={() => setUploads([])}
                className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Dismiss"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* File list */}
          {!panelMinimised && (
            <ul className="max-h-52 overflow-y-auto divide-y divide-border">
              {uploads.map((u) => (
                <li key={u.id} className="flex items-center gap-3 px-4 py-2.5">
                  {/* Status icon */}
                  {u.status === "uploading" && (
                    <Loader2 size={16} className="shrink-0 text-primary animate-spin" />
                  )}
                  {u.status === "done" && (
                    <CheckCircle2 size={16} className="shrink-0 text-green-500" />
                  )}
                  {u.status === "error" && (
                    <XCircle size={16} className="shrink-0 text-destructive" />
                  )}

                  {/* File name */}
                  <span className="text-sm text-foreground truncate">{u.name}</span>

                  {/* Status label */}
                  <span className={`ml-auto text-xs shrink-0 ${
                    u.status === "done"  ? "text-green-500" :
                    u.status === "error" ? "text-destructive" :
                    "text-muted-foreground"
                  }`}>
                    {u.status === "uploading" ? "Uploading" : u.status === "done" ? "Done" : "Failed"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </>
  );
};
