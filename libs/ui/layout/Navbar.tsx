"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";

export const Navbar = () => {
  const [search, setSearch] = useState("");
  const { data: session } = useSession();

  const user = session?.user;

  return (
    <header className="h-14 border-b bg-white flex items-center px-4 justify-between">
      {/* Search */}
      <input
        type="text"
        placeholder="Search files..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-1/2 px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Notification */}
        <button className="text-gray-600 hover:text-black">
          🔔
        </button>

        {/* User Initial */}
        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium">
          {user?.name?.charAt(0).toUpperCase() || "U"}
        </div>

        {/* Logout Button */}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="bg-red-500 text-white px-3 py-1 rounded text-sm"
        >
          Logout
        </button>
      </div>
    </header>
  );
};