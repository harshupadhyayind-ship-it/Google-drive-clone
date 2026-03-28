"use client";

import { useRef, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { UploadCloud } from "lucide-react";
import { useUpload } from "@/lib/context/UploadContext";

type Props = { children: ReactNode };

export function DragDropZone({ children }: Props) {
  const { uploadFromDrop } = useUpload();
  const searchParams    = useSearchParams();
  const currentFolderId = searchParams.get("folderId") ?? "";

  const [dragging, setDragging] = useState(false);
  const dragCounter = useRef(0); // track nested drag-enter/leave

  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current++;
    if (dragCounter.current === 1) setDragging(true);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // required to allow drop
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) setDragging(false);
  };

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current = 0;
    setDragging(false);

    const items = e.dataTransfer.items;
    if (!items || items.length === 0) return;

    await uploadFromDrop(items, currentFolderId);
  };

  return (
    <div
      className="relative flex-1 flex flex-col min-h-0"
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {children}

      {/* Drop overlay */}
      {dragging && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center
          bg-background/80 backdrop-blur-sm border-2 border-dashed border-primary rounded-xl
          pointer-events-none">
          <div className="p-5 rounded-2xl bg-primary/10 mb-4">
            <UploadCloud size={48} className="text-primary" />
          </div>
          <p className="text-lg font-semibold text-foreground">Drop files or folders here</p>
          <p className="text-sm text-muted-foreground mt-1">
            Multiple folders supported — structure is preserved
          </p>
        </div>
      )}
    </div>
  );
}
