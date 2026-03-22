"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, FileText } from "lucide-react";

const menuItems = [
  { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { name: "Users", path: "/admin/users", icon: Users },
  { name: "Files", path: "/admin/files", icon: FileText },
];

export const AdminSidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-full bg-gray-900 text-white p-4 flex flex-col">
      {/* Header */}
      <h2 className="text-lg font-semibold mb-6 px-2">
        Admin Panel
      </h2>

      {/* Menu */}
      <nav className="flex flex-col gap-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-gray-800 text-white font-medium"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <Icon size={18} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="mt-auto pt-6 text-xs text-gray-400">
        Admin Controls
      </div>
    </aside>
  );
};