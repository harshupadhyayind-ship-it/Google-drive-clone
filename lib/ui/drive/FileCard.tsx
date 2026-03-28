"use client";

import { getFileIcon } from "@/lib/utils/fileIcon";
import { DriveMenu, MenuItem } from "../components/Menu/DriveMenu";
import { PenLine, Download, Trash2, Star, Share2, Check, FolderInput, Copy, Eye, ExternalLink } from "lucide-react";

type Props = {
  id: string;
  name: string;
  href: string;
  viewMode?: "grid" | "list";
  isStarred?: boolean;
  isSelected?: boolean;
  selectionMode?: boolean;
  onSelect?: () => void;
  onRename?: () => void;
  onStar?: () => void;
  onShare?: () => void;
  onDownload?: () => void;
  onMoveTo?: () => void;
  onCreateCopy?: () => void;
  onMoveToTrash?: () => void;
  onPreview?: () => void;
};

type ThumbKind = "image" | "pdf" | "video" | "icon";

function getThumbKind(name: string): ThumbKind {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg", "ico", "avif"].includes(ext)) return "image";
  if (ext === "pdf") return "pdf";
  if (["mp4", "webm", "mov", "ogg"].includes(ext)) return "video";
  return "icon";
}

export const FileCard = ({
  id,
  name,
  href,
  viewMode = "grid",
  isStarred,
  isSelected,
  selectionMode,
  onSelect,
  onRename,
  onStar,
  onShare,
  onDownload,
  onMoveTo,
  onCreateCopy,
  onMoveToTrash,
  onPreview,
}: Props) => {
  const Icon = getFileIcon(name);
  const thumbKind = getThumbKind(name);

  const menuItems: MenuItem[] = [
    {
      label: "Preview",
      icon: <Eye className="h-4 w-4" />,
      onClick: (e?: any) => { e?.stopPropagation(); onPreview?.(); },
    },
    {
      label: "Open in new tab",
      icon: <ExternalLink className="h-4 w-4" />,
      onClick: (e?: any) => {
        e?.stopPropagation();
        fetch(`/api/file/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lastAccessedAt: new Date().toISOString() }),
        });
        window.open(href, "_blank");
      },
    },
    { separator: true },
    {
      label: "Rename",
      icon: <PenLine className="h-4 w-4" />,
      onClick: (e?: any) => { e?.stopPropagation(); onRename?.(); },
    },
    {
      label: isStarred ? "Unstar" : "Star",
      icon: <Star className={`h-4 w-4 ${isStarred ? "fill-yellow-400 text-yellow-400" : ""}`} />,
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
    {
      label: "Create Copy",
      icon: <Copy className="h-4 w-4" />,
      onClick: (e?: any) => { e?.stopPropagation(); onCreateCopy?.(); },
    },
    { separator: true },
    {
      label: "Move to Trash",
      icon: <Trash2 className="h-4 w-4" />,
      variant: "destructive",
      onClick: (e?: any) => { e?.stopPropagation(); onMoveToTrash?.(); },
    },
  ];

  const handleCardClick = () => {
    if (selectionMode) { onSelect?.(); return; }
    onPreview?.();
  };

  /* ── LIST VIEW ──────────────────────────────────────────────────── */
  if (viewMode === "list") {
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
        {/* Checkbox */}
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

        {/* Icon + name */}
        <div className="flex items-center gap-3 overflow-hidden pl-6">
          <div className="p-2 bg-primary/15 text-primary rounded-lg shrink-0">
            <Icon size={18} />
          </div>
          <p className="text-sm font-medium text-foreground truncate group-hover:text-primary">
            {name}
          </p>
        </div>

        {/* Three-dot menu */}
        {!selectionMode && (
          <div onClick={(e) => e.stopPropagation()} className="shrink-0">
            <DriveMenu items={menuItems} />
          </div>
        )}
      </div>
    );
  }

  /* ── GRID VIEW (thumbnail card) ─────────────────────────────────── */
  return (
    <div
      className={`group relative flex flex-col border rounded-xl bg-card overflow-hidden
        hover:shadow-lg transition-all cursor-pointer select-none
        ${isSelected
          ? "border-primary/60 bg-primary/5 shadow-sm shadow-primary/10"
          : "border-border hover:border-primary/30"
        }`}
      onClick={handleCardClick}
    >
      {/* Checkbox */}
      <div
        className={`absolute top-2 left-2 z-10 w-5 h-5 rounded-md border-2 flex items-center justify-center
          transition-all duration-150 shrink-0
          ${selectionMode || isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
          ${isSelected
            ? "bg-primary border-primary"
            : "border-muted-foreground/50 bg-card/80 backdrop-blur-sm hover:border-primary"
          }`}
        onClick={(e) => { e.stopPropagation(); onSelect?.(); }}
        role="checkbox"
        aria-checked={!!isSelected}
        aria-label={isSelected ? "Deselect file" : "Select file"}
      >
        {isSelected && <Check size={11} className="text-primary-foreground" strokeWidth={3} />}
      </div>

      {/* Thumbnail */}
      <div className="relative w-full bg-muted/40 overflow-hidden" style={{ height: 160 }}>
        {thumbKind === "image" && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={href} alt={name} className="w-full h-full object-cover" loading="lazy" />
        )}
        {thumbKind === "pdf" && (
          <div className="w-full h-full overflow-hidden relative">
            <iframe
              src={href}
              title={name}
              scrolling="no"
              style={{
                width: 640, height: 900, border: "none",
                transform: "scale(0.35)", transformOrigin: "top left",
                pointerEvents: "none", userSelect: "none",
              }}
            />
            <div className="absolute inset-0" />
          </div>
        )}
        {thumbKind === "video" && (
          <video
            src={href} className="w-full h-full object-cover"
            preload="metadata" muted style={{ pointerEvents: "none" }}
          />
        )}
        {thumbKind === "icon" && (
          <div className="w-full h-full flex items-center justify-center">
            <div className="p-4 rounded-2xl bg-primary/10">
              <Icon size={40} className="text-primary/70" />
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-200" />
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-t border-border bg-card">
        <div className="p-1.5 bg-primary/10 text-primary rounded-md shrink-0">
          <Icon size={14} />
        </div>
        <p className="flex-1 text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">
          {name}
        </p>
        {!selectionMode && (
          <div onClick={(e) => e.stopPropagation()} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <DriveMenu items={menuItems} />
          </div>
        )}
      </div>
    </div>
  );
};
