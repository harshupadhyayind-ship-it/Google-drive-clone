// app/(user)/layout.tsx
import { Sidebar } from "@/libs/ui/layout/Sidebar";
import { Navbar } from "@/libs/ui/layout/Navbar";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="p-4 overflow-auto">{children}</main>
      </div>
    </div>
  );
}