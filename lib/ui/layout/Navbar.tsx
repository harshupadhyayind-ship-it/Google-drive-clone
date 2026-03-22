"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { Search, Bell } from "lucide-react";
import { Input } from "../components/Input";
import { Button } from "../components/Button";

export const Navbar = () => {
  const [search, setSearch] = useState("");
  const { data: session } = useSession();

  const user = session?.user;

  return (
    <header className="h-14 border-b bg-white flex items-center px-4 justify-between">
      {/* 🔍 Search */}
      <div className="relative w-1/2">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <Input
          placeholder="Search files..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* 🔔 Notification */}
        <Button variant="ghost" size="icon">
          <Bell size={18} />
        </Button>

        {/* 👤 Profile Dropdown */}
        <div className="relative group">
          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium cursor-pointer">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
            <div className="px-3 py-2 text-sm text-gray-600 border-b">
              {user?.email}
            </div>

            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};