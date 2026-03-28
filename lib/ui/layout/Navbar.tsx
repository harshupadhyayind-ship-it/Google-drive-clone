"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "@/lib/context/ThemeContext";
import { Search, Menu, LogOut, Folder, File, Sun, Moon } from "lucide-react";
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
  showNotifications?: boolean;
};

export const Navbar = ({ onMenuClick, showNotifications = true }: Props) => {
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme, mounted } = useTheme();

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
      if (results.length > 0) {
        const rect = wrapperRef.current?.getBoundingClientRect();
        if (rect) setDropdownPos({ top: rect.bottom + 6, left: rect.left, width: rect.width });
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
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
      router.push(`/?folderId=${item._id}`);
    } else {
      window.open(item.url, "_blank");
    }
  };

  const handleSearch = () => {
    if (!search.trim()) return;
    setShowSuggestions(false);
    router.push(`/search?q=${encodeURIComponent(search.trim())}`);
  };

  return (
    <header className="h-14 border-b border-border bg-card/95 backdrop-blur-sm flex items-center px-4 gap-3 justify-between">
      {/* Hamburger (mobile only) */}
      <Button variant="ghost" size="icon" className="md:hidden shrink-0" onClick={onMenuClick}>
        <Menu size={20} />
      </Button>

      {/* Search — hidden for admin */}
      {user?.role !== "admin" && (
        <div ref={wrapperRef} className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
          <Input
            placeholder="Search files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
              if (e.key === "Escape") setShowSuggestions(false);
            }}
            onFocus={() => {
              if (suggestions.length > 0) {
                const rect = wrapperRef.current?.getBoundingClientRect();
                if (rect) setDropdownPos({ top: rect.bottom + 6, left: rect.left, width: rect.width });
                setShowSuggestions(true);
              }
            }}
            className="pl-9 w-full"
          />
        </div>
      )}

      {/* Suggestions — rendered in a portal so the header stacking context can't clip it */}
      {mounted && showSuggestions && createPortal(
        <div
          style={{ top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width }}
          className="fixed z-[9999] bg-card border border-border rounded-xl shadow-2xl shadow-black/20 overflow-hidden"
        >
          {suggestions.map((item) => (
            <button
              key={item._id}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-muted text-left transition-colors"
              onMouseDown={() => handleSelect(item)}
            >
              <span className={`p-1 rounded shrink-0 ${item.type === "folder" ? "bg-yellow-500/20 text-yellow-400" : "bg-primary/20 text-primary"}`}>
                {item.type === "folder" ? <Folder size={14} /> : <File size={14} />}
              </span>
              <span className="truncate text-foreground">{item.name}</span>
              <span className="ml-auto text-xs text-muted-foreground shrink-0 capitalize">{item.type}</span>
            </button>
          ))}

          <button
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-primary/10 border-t border-border transition-colors"
            onMouseDown={handleSearch}
          >
            <Search size={14} />
            Search for &ldquo;{search}&rdquo;
          </button>
        </div>,
        document.body
      )}

      {/* Right Section */}
      <div className="flex items-center gap-2 shrink-0 ml-auto">
        {/* Theme Toggle — only render after mount to avoid SSR/client mismatch */}
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </Button>
        )}

        {showNotifications && <NotificationBell />}

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-white flex items-center justify-center font-medium cursor-pointer select-none shadow-lg">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuLabel className="font-normal text-muted-foreground truncate">
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
