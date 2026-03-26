"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, FileText, Folder, X } from "lucide-react";
import { Button } from "@/lib/ui/components/Button";

type NotificationItem = {
  _id: string;
  message: string;
  itemType?: string;
  fromUserName?: string;
  read: boolean;
  createdAt: string;
};

export const NotificationBell = () => {
  const [open, setOpen]               = useState(false);
  const [items, setItems]             = useState<NotificationItem[]>([]);
  const [unread, setUnread]           = useState(0);
  const [loading, setLoading]         = useState(false);
  const panelRef                      = useRef<HTMLDivElement>(null);
  const bellRef                       = useRef<HTMLButtonElement>(null);

  // ── fetch list ──────────────────────────────────────────────────────────────
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

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // ── real-time SSE ────────────────────────────────────────────────────────────
  useEffect(() => {
    const es = new EventSource("/api/notifications/stream");

    es.addEventListener("notification", (e) => {
      try {
        const notif: NotificationItem = JSON.parse(e.data);
        setItems((prev) => [notif, ...prev]);
        setUnread((c) => c + 1);
      } catch {}
    });

    es.addEventListener("ping", () => {/* keep-alive */});

    es.onerror = () => {
      // Browser will auto-reconnect; nothing to do
    };

    return () => es.close();
  }, []);

  // ── mark all read when panel opens ──────────────────────────────────────────
  useEffect(() => {
    if (!open || unread === 0) return;
    fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) })
      .then(() => {
        setUnread(0);
        setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      })
      .catch(() => {});
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── close on outside click ───────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        bellRef.current &&
        !bellRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1)  return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div className="relative">
      {/* Bell button */}
      <Button
        ref={bellRef}
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setOpen((v) => !v)}
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </Button>

      {/* Panel */}
      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white border rounded-2xl shadow-xl z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <p className="text-sm font-semibold text-gray-800">Notifications</p>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
              <X size={15} />
            </button>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {loading && (
              <p className="text-sm text-gray-400 text-center py-6">Loading…</p>
            )}

            {!loading && items.length === 0 && (
              <div className="text-center py-10 space-y-2">
                <Bell size={28} className="mx-auto text-gray-200" />
                <p className="text-sm text-gray-400">No notifications yet</p>
              </div>
            )}

            {!loading &&
              items.map((n) => (
                <div
                  key={n._id}
                  className={`flex items-start gap-3 px-4 py-3 border-b last:border-0 transition-colors ${
                    n.read ? "bg-white" : "bg-blue-50"
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                      n.itemType === "folder"
                        ? "bg-yellow-100 text-yellow-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {n.itemType === "folder" ? (
                      <Folder size={14} />
                    ) : (
                      <FileText size={14} />
                    )}
                  </div>

                  {/* Text */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-800 leading-snug">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                  </div>

                  {/* Unread dot */}
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                  )}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
