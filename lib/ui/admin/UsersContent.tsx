"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Loader2, Search, Trash2, ShieldCheck, User } from "lucide-react";
import { Button } from "@/lib/ui/components/Button";
import { Input } from "@/lib/ui/components/Input";
import { useToast } from "@/lib/context/ToastContext";
import { Badge } from "@/lib/ui/components/Badge";

type UserItem = {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  fileCount: number;
  createdAt: string;
};

type Props = {
  initialUsers: UserItem[];
  initialTotal: number;
};

const LIMIT = 20;

export const UsersContent = ({ initialUsers, initialTotal }: Props) => {
  const toast = useToast();
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialUsers.length < initialTotal);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const fetchUsers = useCallback(async (q: string, pg: number, reset: boolean) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?q=${encodeURIComponent(q)}&page=${pg}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUsers((prev) => (reset ? data.users : [...prev, ...data.users]));
      setTotal(data.total);
      setHasMore(data.hasMore);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchInput]);

  useEffect(() => {
    if (page === 1) fetchUsers(search, 1, true);
  }, [search, fetchUsers]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchUsers(search, nextPage, false);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, page, search, fetchUsers]);

  const handleRoleToggle = async (id: string, currentRole: "admin" | "user") => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) throw new Error();
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, role: newRole } : u)));
      toast.success(`Role changed to ${newRole}`);
    } catch {
      toast.error("Failed to update role");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this user and all their files? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setUsers((prev) => prev.filter((u) => u._id !== id));
      setTotal((t) => t - 1);
      toast.success("User deleted");
    } catch {
      toast.error("Failed to delete user");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-foreground">Users</h1>
        <span className="text-sm text-muted-foreground">{total} total</span>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Email</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Role</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Files</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Joined</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No users found
                  </td>
                </tr>
              )}
              {users.map((user, i) => (
                <tr key={user._id ?? i} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{user.name}</td>
                  <td className="px-4 py-3 text-muted-foreground max-w-[180px] truncate">{user.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant={user.role === "admin" ? "admin" : "user"}>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{user.fileCount}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString(undefined, {
                      year: "numeric", month: "short", day: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRoleToggle(user._id, user.role)}
                        title={user.role === "admin" ? "Revoke admin" : "Make admin"}
                      >
                        {user.role === "admin" ? (
                          <User size={14} className="mr-1" />
                        ) : (
                          <ShieldCheck size={14} className="mr-1" />
                        )}
                        {user.role === "admin" ? "Revoke" : "Make Admin"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleDelete(user._id)}
                      >
                        <Trash2 size={14} className="mr-1" />
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div ref={sentinelRef} className="py-3 flex justify-center">
          {loading && <Loader2 size={18} className="animate-spin text-muted-foreground" />}
          {!hasMore && users.length > 0 && (
            <p className="text-xs text-muted-foreground">All users loaded</p>
          )}
        </div>
      </div>
    </div>
  );
};
