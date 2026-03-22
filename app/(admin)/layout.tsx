// app/(admin)/layout.tsx
import { AdminSidebar } from "@/libs/ui/layout/AdminSidebar";
import { Navbar } from "@/libs/ui/layout/Navbar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}