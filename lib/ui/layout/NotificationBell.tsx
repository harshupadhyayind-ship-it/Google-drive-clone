"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Bell, FileText, Folder, X } from "lucide-react";
import { Button } from "@/lib/ui/components/Button";
import Link from "next/link";

type NotificationItem = {
  _id: string;
  message: string;
  itemType?: string;
  fromUserName?: string;
  link?: string;
  read: boolean;
  createdAt: string;
};

export const NotificationBell = () => {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen]   = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [panelPos, setPanelPos] = useState({ top: 0, right: 0 });

  // Only enable portal after client mount — avoids SSR/client mismatch
  useEffect(() => { setMounted(true); }, []);

  const panelRef = useRef<HTMLDivElement>(null);
  const bellRef  = useRef<HTMLButtonElement>(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      setItems(data.notifications ?? []);
      setUnread(data.unreadCount ?? 0);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  useEffect(() => {
    const es = new EventSource("/api/notifications/stream");
    es.addEventListener("notification", (e) => {
      try {
        const notif: NotificationItem = JSON.parse(e.data);
        setItems((prev) => [notif, ...prev]);
        setUnread((c) => c + 1);
      } catch {}
    });
    es.addEventListener("ping", () => {});
    es.onerror = () => {};
    return () => es.close();
  }, []);

  useEffect(() => {
    if (!open || unread === 0) return;
    fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })
      .then(() => {
        setUnread(0);
        setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      })
      .catch(() => {});
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        bellRef.current  && !bellRef.current.contains(e.target as Node)
      ) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Calculate panel position from bell button's bounding rect
  const handleToggle = () => {
    if (!open && bellRef.current) {
      const rect = bellRef.current.getBoundingClientRect();
      setPanelPos({
        top:   rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
    setOpen((v) => !v);
  };

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1)  return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  const panel = open ? (
    <div
      ref={panelRef}
      style={{ top: panelPos.top, right: panelPos.right }}
      className="fixed w-80 max-w-[calc(100vw-2rem)] bg-card border border-border rounded-2xl shadow-2xl shadow-black/20 z-[9999] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <p className="text-sm font-semibold text-foreground">Notifications</p>
        <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
          <X size={15} />
        </button>
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto">
        {loading && (
          <p className="text-sm text-muted-foreground text-center py-6">Loading…</p>
        )}

        {!loading && items.length === 0 && (
          <div className="text-center py-10 space-y-2">
            <Bell size={28} className="mx-auto text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No notifications yet</p>
          </div>
        )}

        {!loading && items.map((n) => {
          const href       = n.link ?? "/dashboard/shared-with-me";
          const isExternal = href.startsWith("http");
          return (
            <Link
              key={n._id}
              href={href}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noopener noreferrer" : undefined}
              onClick={() => setOpen(false)}
              className={`flex items-start gap-3 px-4 py-3 border-b border-border last:border-0 transition-colors cursor-pointer hover:bg-muted ${
                n.read ? "bg-card" : "bg-primary/5"
              }`}
            >
              <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                n.itemType === "folder"
                  ? "bg-yellow-500/15 text-yellow-500"
                  : "bg-purple-500/15 text-purple-400"
              }`}>
                {n.itemType === "folder" ? <Folder size={14} /> : <FileText size={14} />}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm text-foreground leading-snug">{n.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{timeAgo(n.createdAt)}</p>
              </div>

              {!n.read && (
                <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  ) : null;

  return (
    <div className="relative">
      <Button
        ref={bellRef}
        variant="ghost"
        size="icon"
        className="relative"
        onClick={handleToggle}
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </Button>

      {/* Render dropdown in a portal so it's never clipped by any parent stacking context */}
      {mounted && createPortal(panel, document.body)}
    </div>
  );
};
