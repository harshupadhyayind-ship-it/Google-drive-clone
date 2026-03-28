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

const menuItems = [
  { name: "My Drive", path: "/dashboard", icon: HardDrive },
  { name: "Shared with me", path: "/dashboard/shared-with-me", icon: Users },
  { name: "Recent", path: "/dashboard/recent", icon: Clock },
  { name: "Starred", path: "/dashboard/starred", icon: Star },
  { name: "Trash", path: "/dashboard/trash", icon: Trash2 },
];

type Props = {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
};

export const Sidebar = ({ userId, isOpen, onClose }: Props) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { setFiles, user, setFolders } = useDrive();

  const currentFolderId = searchParams.get("folderId");

  const [open, setOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [storage, setStorage] = useState({ usedMB: 0, totalMB: 100, percent: 0 });

  useEffect(() => {
    fetch("/api/storage")
      .then((r) => r.json())
      .then((d) => {
        if (d.usedMB !== undefined) setStorage(d);
      })
      .catch(() => {});
  }, []);

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", user.id);
    formData.append("folderId", currentFolderId || "");

    const res = await fetch("/api/file", { method: "POST", body: formData });
    const saved = await res.json();
    setFiles((prev: any) => [saved, ...prev]);
  };

  const handleCreateFolder = async () => {
    if (!folderName) return;

    const res = await fetch("/api/folder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: folderName, parentId: currentFolderId, userId }),
    });

    const saved = await res.json();
    setFolders((prev: any) => [saved, ...prev]);
    setFolderName("");
    setOpen(false);
  };

  // On mobile: fixed overlay when open, hidden when closed
  // On desktop: always visible as w-64
  const asideClass = isOpen
    ? "fixed inset-y-0 left-0 z-50 flex flex-col w-64 h-full bg-sidebar border-r border-sidebar-border p-4"
    : "hidden md:flex md:flex-col md:w-64 h-full bg-sidebar border-r border-sidebar-border p-4";

  return (
    <>
      {/* Dark overlay on mobile when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={asideClass}>
        {/* Logo + close button */}
        <div className="flex items-center justify-between mb-6 px-2">
          <Link href="/dashboard">
            <Image src="/logo.svg" alt="NovaDrive" width={130} height={32} priority />
          </Link>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={onClose}>
            <X size={18} />
          </Button>
        </div>

        {/* New Button */}
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
                Upload File
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setOpen(true)}>
                <FolderPlus size={16} className="mr-2" />
                New Folder
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
            }}
          />
        </div>

        {/* Menu */}
        <nav className="flex flex-col gap-1">
          {menuItems.map((item) => {
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
    </>
  );
};
