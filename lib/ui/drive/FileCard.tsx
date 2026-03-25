"use client";

import { getFileIcon } from "@/lib/utils/fileIcon";
import Link from "next/link";
import { DriveMenu, MenuItem } from "../components/Menu/DriveMenu";
import { Pencil, Download, Trash } from "lucide-react";

type Props = {
  name: string;
  href: string;
  onRename?: () => void;
  onDownload?: () => void;
  onMoveToTrash?: () => void;
};

export const FileCard = ({
  name,
  href,
  onRename,
  onDownload,
  onMoveToTrash,
}: Props) => {
  const Icon = getFileIcon(name);

  const menuItems: MenuItem[] = [
    {
      label: "Rename",
      icon: <Pencil className="h-4 w-4" />,
      onClick: (e?: any) => {
        e?.stopPropagation();
        onRename?.();
      },
    },
    {
      label: "Download",
      icon: <Download className="h-4 w-4" />,
      onClick: (e?: any) => {
        e?.stopPropagation();
        onDownload?.();
      },
    },
    { separator: true },
    {
      label: "Move to Trash",
      icon: <Trash className="h-4 w-4" />,
      variant: "destructive",
      onClick: (e?: any) => {
        e?.stopPropagation();
        onMoveToTrash?.();
      },
    },
  ];

  return (
    <Link href={href} target="_blank">
      <div className="group flex items-center justify-between gap-3 p-3 border rounded-xl bg-white hover:shadow-md hover:border-blue-400 transition-all cursor-pointer">
        
        {/* LEFT SIDE */}
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
            <Icon size={18} />
          </div>

          <p className="text-sm font-medium text-gray-800 truncate group-hover:text-blue-600">
            {name}
          </p>
        </div>

        {/* RIGHT SIDE MENU */}
        <div
          onClick={(e) => e.stopPropagation()}
        >
          <DriveMenu items={menuItems} />
        </div>
      </div>
    </Link>
  );
};