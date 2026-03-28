"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { ToastProvider } from "@/lib/context/ToastContext";
import { UploadProvider } from "@/lib/context/UploadContext";
import { DragDropZone } from "@/lib/ui/drive/DragDropZone";

type Props = {
  userId: string;
  children: React.ReactNode;
};

export const UserLayoutClient = ({ userId, children }: Props) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ToastProvider>
      <UploadProvider>
        <Sidebar
          userId={userId}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar onMenuClick={() => setSidebarOpen(true)} />
          <DragDropZone>
            <main className="p-4 overflow-auto flex-1 bg-background">{children}</main>
          </DragDropZone>
        </div>
      </UploadProvider>
    </ToastProvider>
  );
};
