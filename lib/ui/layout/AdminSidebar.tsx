"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, FileText, Folder, X } from "lucide-react";

const menuItems = [
  { name: "Dashboard", path: "/overview",  icon: LayoutDashboard },
  { name: "Users",     path: "/users",     icon: Users           },
  { name: "Files",     path: "/files",     icon: FileText        },
  { name: "Folders",   path: "/folders",   icon: Folder          },
];

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export const AdminSidebar = ({ isOpen, onClose }: Props) => {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-sidebar border-r border-sidebar-border text-sidebar-foreground p-4 flex flex-col
          transition-transform duration-200
          md:static md:translate-x-0 md:z-auto
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2 px-2">
          <Link href="/overview">
            <Image src="/logo.svg" alt="VegaDrive" width={130} height={32} priority />
          </Link>
          <button
            className="md:hidden text-muted-foreground hover:text-foreground"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>
        <p className="text-xs text-purple-400 font-medium px-2 mb-6 tracking-widest uppercase">Admin Panel</p>

        {/* Menu */}
        <nav className="flex flex-col gap-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                  isActive
                    ? "bg-primary/15 text-primary font-medium border border-primary/20"
                    : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                }`}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="mt-auto pt-6 text-xs text-muted-foreground/50">VegaDrive Admin Controls</div>
      </aside>
    </>
  );
};
