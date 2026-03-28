"use client";

import { getFileIcon } from "@/lib/utils/fileIcon";
import { DriveMenu, MenuItem } from "../components/Menu/DriveMenu";
import { Pencil, Download, Trash, Star, Share2, Check, FolderInput } from "lucide-react";

type Props = {
  id: string;
  name: string;
  href: string;
  isStarred?: boolean;
  isSelected?: boolean;
  selectionMode?: boolean;
  onSelect?: () => void;
  onRename?: () => void;
  onStar?: () => void;
  onShare?: () => void;
  onDownload?: () => void;
  onMoveTo?: () => void;
  onMoveToTrash?: () => void;
};

export const FileCard = ({
  id,
  name,
  href,
  isStarred,
  isSelected,
  selectionMode,
  onSelect,
  onRename,
  onStar,
  onShare,
  onDownload,
  onMoveTo,
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
    {
      label: "Move to",
      icon: <FolderInput className="h-4 w-4" />,
      onClick: (e?: any) => { e?.stopPropagation(); onMoveTo?.(); },
    },
    { separator: true },
    {
      label: "Move to Trash",
      icon: <Trash className="h-4 w-4" />,
      variant: "destructive",
      onClick: (e?: any) => { e?.stopPropagation(); onMoveToTrash?.(); },
    },
  ];

  const handleCardClick = () => {
    if (selectionMode) {
      onSelect?.();
      return;
    }
    // Update lastAccessedAt then open file
    fetch(`/api/file/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lastAccessedAt: new Date().toISOString() }),
    });
    window.open(href, "_blank");
  };

  return (
    <div
      className={`group relative flex items-center justify-between gap-3 p-3 border rounded-xl bg-card
        hover:shadow-md transition-all cursor-pointer
        ${isSelected
          ? "border-primary/60 bg-primary/5 shadow-sm shadow-primary/10"
          : "border-border hover:border-primary/40"
        }`}
      onClick={handleCardClick}
    >
      {/* Checkbox — always in DOM, shown on hover or when in selection mode */}
      <div
        className={`absolute top-2 left-2 z-10 w-5 h-5 rounded-md border-2 flex items-center justify-center
          transition-all duration-150 shrink-0
          ${selectionMode || isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
          ${isSelected
            ? "bg-primary border-primary"
            : "border-muted-foreground/50 bg-card hover:border-primary"
          }`}
        onClick={(e) => { e.stopPropagation(); onSelect?.(); }}
        role="checkbox"
        aria-checked={!!isSelected}
        aria-label={isSelected ? "Deselect file" : "Select file"}
      >
        {isSelected && <Check size={11} className="text-primary-foreground" strokeWidth={3} />}
      </div>

      {/* LEFT — icon + name */}
      <div className="flex items-center gap-3 overflow-hidden pl-6">
        <div className="p-2 bg-primary/15 text-primary rounded-lg shrink-0">
          <Icon size={18} />
        </div>
        <p className="text-sm font-medium text-foreground truncate group-hover:text-primary">
          {name}
        </p>
      </div>

      {/* RIGHT — three-dot menu (hidden in selection mode) */}
      {!selectionMode && (
        <div onClick={(e) => e.stopPropagation()} className="shrink-0">
          <DriveMenu items={menuItems} />
        </div>
      )}
    </div>
  );
};
