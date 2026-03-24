"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  HardDrive,
  Clock,
  Star,
  Trash2,
  Upload,
  FolderPlus,
} from "lucide-react";
import { useRef } from "react";
import { Button } from "../components/Button";
import { useDrive } from "@/lib/context/DriveContext";

const menuItems = [
  { name: "My Drive", path: "/dashboard", icon: HardDrive },
  { name: "Recent", path: "/dashboard/recent", icon: Clock },
  { name: "Starred", path: "/dashboard/starred", icon: Star },
  { name: "Trash", path: "/dashboard/trash", icon: Trash2 },
];

export const Sidebar = ({ userId }: {userId: string}) => {
  const pathname = usePathname();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const searchParams = useSearchParams();
  const { setFiles, user, setFolders  } = useDrive();

  // Get folderId directly from URL
  const currentFolderId = searchParams.get("folderId");

  // Upload File
  const handleUpload = async (file: File) => {

  const formData = new FormData();
  formData.append("file", file);
  formData.append("userId", user.id);
  formData.append("folderId", currentFolderId || "");

  const res = await fetch("/api/file", {
    method: "POST",
    body: formData,
  });

  const saved = await res.json();

  // replace temp
  setFiles((prev:any)=> [saved, ...prev]);
};

  // Create Folder
  const handleCreateFolder = async () => {
  const name = prompt("Enter folder name");
  if (!name) return;

  const res = await fetch("/api/folder", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      parentId: currentFolderId,
      userId,
    }),
  });

  const saved = await res.json();

  setFolders((prev:any)=> [saved, ...prev]);
};

  return (
    <aside className="w-64 h-full bg-white border-r p-4 flex flex-col">
      {/* Logo */}
      <h2 className="text-xl font-semibold mb-6 px-2">
        Drive
      </h2>

      {/* Upload Section */}
      <div className="mb-6 space-y-2">
        <Button
          className="w-full flex items-center gap-2"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={16} />
          Upload File
        </Button>

        <Button
          variant="outline"
          className="w-full flex items-center gap-2"
          onClick={handleCreateFolder}
        >
          <FolderPlus size={16} />
          New Folder
        </Button>

        {/* Hidden file input */}
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
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-blue-100 text-blue-600 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
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
        <p className="text-xs text-gray-500 mb-1">Storage</p>

        <div className="w-full bg-gray-200 h-2 rounded">
          <div className="bg-blue-500 h-2 rounded w-1/3 transition-all" />
        </div>

        <p className="text-xs mt-1 text-gray-600">
          5GB of 15GB used
        </p>
      </div>
    </aside>
  );
};