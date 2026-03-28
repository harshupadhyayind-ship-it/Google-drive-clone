"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/lib/ui/components/Dialog/dialog";
import { Button } from "@/lib/ui/components/Button";
import { Input } from "@/lib/ui/components/Input";
import { useToast } from "@/lib/context/ToastContext";
import {
  Copy, Check, Link, Trash2, Loader2,
  Folder, FileText, Search, UserPlus, X, Globe,
} from "lucide-react";

type UserResult = { _id: string; name: string; email: string };

type ShareRecord = {
  _id: string;
  shareType: "public" | "user";
  token?: string;
  sharedWithUserId?: UserResult | null;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: string;
  itemType: "file" | "folder";
  itemName: string;
};

export const ShareDialog = ({ open, onOpenChange, itemId, itemType, itemName }: Props) => {
  const toast = useToast();

  // Public share
  const [publicShare, setPublicShare] = useState<ShareRecord | null>(null);
  const [publicLoading, setPublicLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // User shares
  const [userShares, setUserShares] = useState<ShareRecord[]>([]);

  // User search
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<UserResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [addingUserId, setAddingUserId] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const shareUrl = publicShare?.token
    ? `${window.location.origin}/share/${publicShare.token}`
    : null;

  // Load existing shares when dialog opens
  useEffect(() => {
    if (!open || !itemId) return;
    fetch(`/api/share?itemId=${itemId}`)
      .then((r) => r.json())
      .then((shares: ShareRecord[]) => {
        setPublicShare(shares.find((s) => s.shareType === "public") ?? null);
        setUserShares(shares.filter((s) => s.shareType === "user"));
      })
      .catch(() => {});
  }, [open, itemId]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setSearchInput("");
      setSearchResults([]);
    }
  }, [open]);

  // Debounced user search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!searchInput.trim() || searchInput.length < 2) {
      setSearchResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(searchInput)}`);
        const data = await res.json();
        // Filter out already shared users
        const sharedIds = userShares.map((s) => s.sharedWithUserId?._id);
        setSearchResults(data.filter((u: UserResult) => !sharedIds.includes(u._id)));
      } catch {}
      setSearchLoading(false);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchInput, userShares]);

  const handleShareWithUser = async (user: UserResult) => {
    setAddingUserId(user._id);
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, itemType, shareType: "user", sharedWithUserId: user._id }),
      });
      if (!res.ok) throw new Error();
      const share = await res.json();
      setUserShares((prev) => [...prev, { ...share, sharedWithUserId: user }]);
      setSearchInput("");
      setSearchResults([]);
      toast.success(`Shared with ${user.name}`);
    } catch {
      toast.error("Failed to share");
    } finally {
      setAddingUserId(null);
    }
  };

  const handleRemoveUserShare = async (shareId: string, userName: string) => {
    try {
      const res = await fetch(`/api/share/${shareId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setUserShares((prev) => prev.filter((s) => s._id !== shareId));
      toast.success(`Removed ${userName}'s access`);
    } catch {
      toast.error("Failed to remove access");
    }
  };

  const handleCreatePublicLink = async () => {
    setPublicLoading(true);
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, itemType, shareType: "public" }),
      });
      if (!res.ok) throw new Error();
      const share = await res.json();
      setPublicShare(share);
      toast.success("Public link created");
    } catch {
      toast.error("Failed to create link");
    } finally {
      setPublicLoading(false);
    }
  };

  const handleRevokePublicLink = async () => {
    if (!publicShare) return;
    setPublicLoading(true);
    try {
      const res = await fetch(`/api/share/${publicShare._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setPublicShare(null);
      toast.success("Public link revoked");
    } catch {
      toast.error("Failed to revoke link");
    } finally {
      setPublicLoading(false);
    }
  };

  const handleCopy = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Link copied");
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[calc(100%-2rem)] overflow-hidden"
        style={{ maxWidth: "440px" }}
      >
        <DialogHeader>
          <DialogTitle>Share</DialogTitle>
        </DialogHeader>

        {/* Item info */}
        <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
          <div className={`p-2 rounded-lg shrink-0 ${itemType === "folder" ? "bg-yellow-100 text-yellow-600" : "bg-blue-100 text-blue-600"}`}>
            {itemType === "folder" ? <Folder size={16} /> : <FileText size={16} />}
          </div>
          <p className="text-sm font-medium text-gray-800 truncate">{itemName}</p>
        </div>

        {/* ── People section ── */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Share with people</p>

          {/* Search input */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
            <Input
              placeholder="Search by name or email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-8 text-sm"
            />
          </div>

          {/* Search results */}
          {(searchLoading || searchResults.length > 0) && (
            <div className="border rounded-xl overflow-hidden">
              {searchLoading && (
                <div className="flex items-center justify-center py-3">
                  <Loader2 size={16} className="animate-spin text-muted-foreground/60" />
                </div>
              )}
              {searchResults.map((user) => (
                <div key={user._id} className="flex items-center justify-between gap-2 px-3 py-2 hover:bg-muted/50">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground/60 truncate">{user.email}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleShareWithUser(user)}
                    disabled={addingUserId === user._id}
                    className="shrink-0"
                  >
                    {addingUserId === user._id
                      ? <Loader2 size={14} className="animate-spin" />
                      : <><UserPlus size={14} className="mr-1" />Add</>
                    }
                  </Button>
                </div>
              ))}
              {!searchLoading && searchResults.length === 0 && searchInput.length >= 2 && (
                <p className="text-sm text-muted-foreground/60 text-center py-3">No users found</p>
              )}
            </div>
          )}

          {/* Users with access */}
          {userShares.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground/60">People with access</p>
              {userShares.map((share) => (
                <div key={share._id} className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg hover:bg-muted/50">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium shrink-0">
                      {share.sharedWithUserId?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{share.sharedWithUserId?.name}</p>
                      <p className="text-xs text-muted-foreground/60 truncate">{share.sharedWithUserId?.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveUserShare(share._id, share.sharedWithUserId?.name ?? "")}
                    className="shrink-0 text-muted-foreground/60 hover:text-red-500 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Public link section ── */}
        <div className="space-y-2 pt-3 border-t overflow-hidden">
          <div className="flex items-center gap-2">
            <Globe size={14} className="text-muted-foreground/60 shrink-0" />
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Public link</p>
          </div>

          {publicShare ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Link size={13} className="text-muted-foreground/60 shrink-0" />
                <p className="text-xs text-muted-foreground">Anyone with the link can view</p>
              </div>
              <div className="w-full px-3 py-2 bg-muted rounded-lg text-xs text-muted-foreground truncate font-mono">
                {shareUrl}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy} className="flex-1 gap-1">
                  {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
                  {copied ? "Copied!" : "Copy link"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRevokePublicLink}
                  disabled={publicLoading}
                  className="text-red-500 hover:text-red-600 shrink-0"
                >
                  {publicLoading ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCreatePublicLink}
              disabled={publicLoading}
              className="w-full gap-2"
            >
              {publicLoading
                ? <Loader2 size={13} className="animate-spin" />
                : <Link size={13} />
              }
              Create public link
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
