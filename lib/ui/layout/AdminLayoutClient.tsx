"use client";

import { useState } from "react";
import { ToastProvider } from "@/lib/context/ToastContext";
import { AdminSidebar } from "./AdminSidebar";
import { Navbar } from "./Navbar";

type Props = {
  children: React.ReactNode;
};

export const AdminLayoutClient = ({ children }: Props) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ToastProvider>
      <div className="flex h-screen bg-background">
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar onMenuClick={() => setSidebarOpen(true)} />
          <main className="p-4 md:p-6 overflow-auto flex-1 bg-background">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
};
