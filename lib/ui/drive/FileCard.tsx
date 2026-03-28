"use client";

import { getFileIcon } from "@/lib/utils/fileIcon";
import Link from "next/link";
import { DriveMenu, MenuItem } from "../components/Menu/DriveMenu";
import { Pencil, Download, Trash, Star, Share2 } from "lucide-react";

type Props = {
  id: string;
  name: string;
  href: string;
  isStarred?: boolean;
  onRename?: () => void;
  onStar?: () => void;
  onShare?: () => void;
  onDownload?: () => void;
  onMoveToTrash?: () => void;
};

export const FileCard = ({
  id,
  name,
  href,
  isStarred,
  onRename,
  onStar,
  onShare,
  onDownload,
  onMoveToTrash,
}: Props) => {
  const Icon = getFileIcon(name);

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

  const handleClick = () => {
    fetch(`/api/file/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lastAccessedAt: new Date().toISOString() }),
    });
  };

  return (
    <Link href={href || "#"} target="_blank" onClick={handleClick}>
      <div className="group flex items-center justify-between gap-3 p-3 border border-border rounded-xl bg-card hover:shadow-md hover:border-primary/40 transition-all cursor-pointer">

        {/* LEFT SIDE */}
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="p-2 bg-primary/15 text-primary rounded-lg">
            <Icon size={18} />
          </div>

          <p className="text-sm font-medium text-foreground truncate group-hover:text-primary">
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
