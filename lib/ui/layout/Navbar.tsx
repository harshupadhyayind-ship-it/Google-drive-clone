"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Search, Menu, LogOut, Folder, FileText } from "lucide-react";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { NotificationBell } from "./NotificationBell";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/lib/ui/components/Menu/dropdown-menu";

type Suggestion = {
  _id: string;
  name: string;
  type: "file" | "folder";
  url?: string;
};

type Props = {
  onMenuClick?: () => void;
};

export const Navbar = ({ onMenuClick }: Props) => {
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!search.trim() || !user?.id) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      const res = await fetch(
        `/api/search?userId=${user.id}&q=${encodeURIComponent(search.trim())}`
      );
      const data = await res.json();

      const results: Suggestion[] = [
        ...(data.folders ?? []).map((f: any) => ({ ...f, type: "folder" as const })),
        ...(data.files ?? []).map((f: any) => ({ ...f, type: "file" as const })),
      ].slice(0, 6);

      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, user?.id]);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (item: Suggestion) => {
    setShowSuggestions(false);
    setSearch("");
    if (item.type === "folder") {
      router.push(`/dashboard?folderId=${item._id}`);
    } else {
      window.open(item.url, "_blank");
    }
  };

  const handleSearch = () => {
    if (!search.trim()) return;
    setShowSuggestions(false);
    router.push(`/dashboard/search?q=${encodeURIComponent(search.trim())}`);
  };

  return (
    <header className="h-14 border-b bg-white flex items-center px-4 gap-3 justify-between">
      {/* Hamburger (mobile only) */}
      <Button variant="ghost" size="icon" className="md:hidden shrink-0" onClick={onMenuClick}>
        <Menu size={20} />
      </Button>

      {/* Search — hidden for admin */}
      {user?.role !== "admin" && (
        <div ref={wrapperRef} className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
          <Input
            placeholder="Search files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
              if (e.key === "Escape") setShowSuggestions(false);
            }}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            className="pl-9 w-full"
          />

          {/* Suggestions dropdown */}
          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-xl shadow-lg z-50 overflow-hidden">
              {suggestions.map((item) => (
                <button
                  key={item._id}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 text-left"
                  onMouseDown={() => handleSelect(item)}
                >
                  <span className={`p-1 rounded ${item.type === "folder" ? "bg-yellow-100 text-yellow-600" : "bg-blue-100 text-blue-600"}`}>
                    {item.type === "folder" ? <Folder size={14} /> : <FileText size={14} />}
                  </span>
                  <span className="truncate text-gray-800">{item.name}</span>
                  <span className="ml-auto text-xs text-gray-400 shrink-0">{item.type}</span>
                </button>
              ))}

              <button
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 border-t"
                onMouseDown={handleSearch}
              >
                <Search size={14} />
                Search for &ldquo;{search}&rdquo;
              </button>
            </div>
          )}
        </div>
      )}

      {/* Right Section */}
      <div className="flex items-center gap-2 shrink-0 ml-auto">
        <NotificationBell />

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
