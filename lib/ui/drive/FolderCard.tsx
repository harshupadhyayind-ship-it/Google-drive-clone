"use client";

import Link from "next/link";
import { Folder, Pencil, Download, Trash, Star, Share2 } from "lucide-react";
import { DriveMenu, MenuItem } from "../components/Menu/DriveMenu";

type Props = {
  name: string;
  href: string;
  isStarred?: boolean;
  onRename?: () => void;
  onStar?: () => void;
  onShare?: () => void;
  onDownload?: () => void;
  onMoveToTrash?: () => void;
};

export const FolderCard = ({
  name,
  href,
  isStarred,
  onRename,
  onStar,
  onShare,
  onDownload,
  onMoveToTrash,
}: Props) => {
  const menuItems: MenuItem[] = [
    {
      label: "Rename",
      icon: <Pencil className="h-4 w-4" />,
      onClick: (e?: any) => { e?.stopPropagation(); onRename?.(); },
    },
    {
      label: isStarred ? "Unstar" : "Star",
      icon: <Star className="h-4 w-4" />,
      onClick: (e?: any) => { e?.stopPropagation(); onStar?.(); },
    },
    {
      label: "Share",
      icon: <Share2 className="h-4 w-4" />,
      onClick: (e?: any) => { e?.stopPropagation(); onShare?.(); },
    },
    {
      label: "Download",
      icon: <Download className="h-4 w-4" />,
      onClick: (e?: any) => { e?.stopPropagation(); onDownload?.(); },
    },
    { separator: true },
    {
      label: "Move to Trash",
      icon: <Trash className="h-4 w-4" />,
      variant: "destructive",
      onClick: (e?: any) => { e?.stopPropagation(); onMoveToTrash?.(); },
    },
  ];

  return (
    <Link href={href}>
      <div className="group flex items-center justify-between gap-3 p-3 border rounded-xl bg-white hover:shadow-md hover:border-yellow-400 transition-all cursor-pointer">

        {/* LEFT SIDE */}
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg">
            <Folder size={18} />
          </div>

          <p className="text-sm font-medium text-gray-800 truncate group-hover:text-yellow-600">
            {name}
          </p>
        </div>

        {/* RIGHT SIDE MENU */}
        <div onClick={(e) => e.stopPropagation()}>
          <DriveMenu items={menuItems} />
        </div>
      </div>
    </Link>
  );
};
