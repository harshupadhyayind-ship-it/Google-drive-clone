"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { name: "My Drive", path: "/dashboard" },
  { name: "Recent", path: "/dashboard/recent" },
  { name: "Starred", path: "/dashboard/starred" },
  { name: "Trash", path: "/dashboard/trash" },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-full bg-white border-r p-4 flex flex-col">
      {/* Logo */}
      <h2 className="text-xl font-bold mb-6">Drive</h2>

      {/* Upload Button */}
      <button className="mb-6 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
        + Upload
      </button>

      {/* Menu */}
      <nav className="flex flex-col gap-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;

          return (
            <Link
              key={item.name}
              href={item.path}
              className={`px-3 py-2 rounded-lg text-sm ${
                isActive
                  ? "bg-blue-100 text-blue-600 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Storage Info */}
      <div className="mt-auto">
        <p className="text-xs text-gray-500">Storage</p>
        <div className="w-full bg-gray-200 h-2 rounded mt-1">
          <div className="bg-blue-500 h-2 rounded w-1/3" />
        </div>
        <p className="text-xs mt-1 text-gray-600">5GB of 15GB used</p>
      </div>
    </aside>
  );
};