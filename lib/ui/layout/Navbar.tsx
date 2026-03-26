"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { Search, Bell, Menu, LogOut } from "lucide-react";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/lib/ui/components/Menu/dropdown-menu";

type Props = {
  onMenuClick?: () => void;
};

export const Navbar = ({ onMenuClick }: Props) => {
  const [search, setSearch] = useState("");
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <header className="h-14 border-b bg-white flex items-center px-4 gap-3 justify-between">
      {/* Hamburger (mobile only) */}
      <Button variant="ghost" size="icon" className="md:hidden shrink-0" onClick={onMenuClick}>
        <Menu size={20} />
      </Button>

      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search files..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 w-full"
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 shrink-0">
        <Button variant="ghost" size="icon">
          <Bell size={18} />
        </Button>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium cursor-pointer select-none">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuLabel className="font-normal text-gray-600 truncate">
              {user?.email}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
              <LogOut size={14} className="mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
