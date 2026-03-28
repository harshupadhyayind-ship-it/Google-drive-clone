"use client";

import { useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Download, ExternalLink, FileX, ChevronLeft, ChevronRight } from "lucide-react";
import { getFileIcon } from "@/lib/utils/fileIcon";
import { Button } from "@/lib/ui/components/Button";

export type PreviewFile = { name: string; url: string };

type Props = {
  open: boolean;
  onClose: () => void;
  /** The currently previewed file */
  file: PreviewFile | null;
  /** All files in the current view — enables prev/next navigation */
  allFiles?: PreviewFile[];
  /** Called when user navigates to a different file */
  onNavigate?: (file: PreviewFile) => void;
};

type PreviewKind = "image" | "video" | "audio" | "pdf" | "none";

function getPreviewKind(name: string): PreviewKind {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg", "ico", "avif"].includes(ext)) return "image";
  if (["mp4", "webm", "ogg", "mov"].includes(ext)) return "video";
  if (["mp3", "wav", "ogg", "flac", "aac", "m4a", "opus"].includes(ext)) return "audio";
  if (ext === "pdf") return "pdf";
  return "none";
}

export const FilePreviewModal = ({ open, onClose, file, allFiles = [], onNavigate }: Props) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  const currentIndex = file ? allFiles.findIndex((f) => f.url === file.url && f.name === file.name) : -1;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < allFiles.length - 1;

  const goPrev = useCallback(() => {
    if (hasPrev) onNavigate?.(allFiles[currentIndex - 1]);
  }, [hasPrev, currentIndex, allFiles, onNavigate]);

  const goNext = useCallback(() => {
    if (hasNext) onNavigate?.(allFiles[currentIndex + 1]);
  }, [hasNext, currentIndex, allFiles, onNavigate]);

  // Keyboard: Escape closes, arrow keys navigate
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape")      onClose();
      if (e.key === "ArrowLeft")   goPrev();
      if (e.key === "ArrowRight")  goNext();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose, goPrev, goNext]);

  // Lock body scroll
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else      document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open || !file) return null;

  const kind = getPreviewKind(file.name);
  const Icon = getFileIcon(file.name);

  const modal = (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />

      {/* Prev arrow */}
      {hasPrev && (
        <button
          onClick={(e) => { e.stopPropagation(); goPrev(); }}
          className="absolute left-4 z-20 p-2 rounded-full bg-card/80 border border-border shadow-lg
            hover:bg-card transition-colors text-foreground"
          title="Previous file (←)"
        >
          <ChevronLeft size={20} />
        </button>
      )}

      {/* Next arrow */}
      {hasNext && (
        <button
          onClick={(e) => { e.stopPropagation(); goNext(); }}
          className="absolute right-4 z-20 p-2 rounded-full bg-card/80 border border-border shadow-lg
            hover:bg-card transition-colors text-foreground"
          title="Next file (→)"
        >
          <ChevronRight size={20} />
        </button>
      )}

      {/* Panel */}
      <div
        className="relative z-10 w-full max-w-4xl max-h-[90vh] flex flex-col
          bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border shrink-0">
          <div className="p-1.5 bg-primary/15 text-primary rounded-lg shrink-0">
            <Icon size={16} />
          </div>
          <p className="flex-1 text-sm font-medium text-foreground truncate">{file.name}</p>

          {/* File counter */}
          {allFiles.length > 1 && (
            <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
              {currentIndex + 1} / {allFiles.length}
            </span>
          )}

          <div className="flex items-center gap-1 shrink-0">
            <a href={file.url} target="_blank" rel="noopener noreferrer" title="Open in new tab">
              <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-foreground">
                <ExternalLink size={15} />
              </Button>
            </a>
            <a href={file.url} download={file.name} title="Download">
              <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-foreground">
                <Download size={15} />
              </Button>
            </a>
            <Button
              variant="ghost" size="icon"
              className="w-8 h-8 text-muted-foreground hover:text-foreground"
              onClick={onClose}
              title="Close (Esc)"
            >
              <X size={15} />
            </Button>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="flex-1 overflow-auto flex items-center justify-center bg-muted/20 min-h-0">

          {kind === "image" && (
            <div className="p-4 flex items-center justify-center w-full h-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={file.url}
                alt={file.name}
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-md"
              />
            </div>
          )}

          {kind === "video" && (
            <div className="p-4 w-full flex justify-center">
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video
                key={file.url}
                src={file.url}
                controls
                className="max-w-full max-h-[70vh] rounded-lg shadow-md"
              />
            </div>
          )}

          {kind === "audio" && (
            <div className="p-8 flex flex-col items-center gap-6 w-full">
              <div className="p-6 bg-primary/10 rounded-full">
                <Icon size={52} className="text-primary" />
              </div>
              <p className="text-sm text-muted-foreground font-medium">{file.name}</p>
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <audio key={file.url} src={file.url} controls className="w-full max-w-md" />
            </div>
          )}

          {kind === "pdf" && (
            <iframe
              key={file.url}
              src={`${file.url}#toolbar=1`}
              title={file.name}
              className="w-full h-[70vh]"
            />
          )}

          {kind === "none" && (
            <div className="p-10 flex flex-col items-center gap-4 text-center">
              <div className="p-5 bg-muted rounded-full">
                <FileX size={40} className="text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Preview not available</p>
                <p className="text-xs text-muted-foreground mt-1">
                  This file type can&apos;t be previewed in the browser.
                </p>
              </div>
              <div className="flex gap-2 mt-2">
                <a href={file.url} download={file.name}>
                  <Button size="sm" variant="outline" className="gap-1.5">
                    <Download size={14} /> Download
                  </Button>
                </a>
                <a href={file.url} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="outline" className="gap-1.5">
                    <ExternalLink size={14} /> Open in new tab
                  </Button>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer nav dots (if multiple files) ── */}
        {allFiles.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 py-2.5 border-t border-border shrink-0">
            {allFiles.map((f, i) => (
              <button
                key={i}
                onClick={() => onNavigate?.(f)}
                className={`rounded-full transition-all ${
                  i === currentIndex
                    ? "w-4 h-1.5 bg-primary"
                    : "w-1.5 h-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60"
                }`}
                title={f.name}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};
