"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HardDrive,
  Clock,
  Star,
  Trash2,
  Upload,
} from "lucide-react";
import { Button } from "../components/Button";

const menuItems = [
  { name: "My Drive", path: "/dashboard", icon: HardDrive },
  { name: "Recent", path: "/dashboard/recent", icon: Clock },
  { name: "Starred", path: "/dashboard/starred", icon: Star },
  { name: "Trash", path: "/dashboard/trash", icon: Trash2 },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-full bg-white border-r p-4 flex flex-col">
      {/* Logo */}
      <h2 className="text-xl font-semibold mb-6 px-2">
        Drive
      </h2>

      {/* Upload Button */}
      <Button className="mb-6 w-full flex items-center gap-2">
        <Upload size={16} />
        Upload
      </Button>

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
                  ? "bg-blue-100 text-blue-600 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Icon size={18} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Storage */}
      <div className="mt-auto pt-6">
        <p className="text-xs text-gray-500 mb-1">Storage</p>

        <div className="w-full bg-gray-200 h-2 rounded">
          <div className="bg-blue-500 h-2 rounded w-1/3 transition-all" />
        </div>

        <p className="text-xs mt-1 text-gray-600">
          5GB of 15GB used
        </p>
      </div>
    </aside>
  );
};