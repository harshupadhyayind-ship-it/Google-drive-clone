"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/lib/ui/components/Dialog/dialog";
import { Button } from "@/lib/ui/components/Button";
import { Folder, ChevronRight, HardDrive, Loader2 } from "lucide-react";

type FolderNode = { _id: string; name: string };
type Crumb      = { id: string | null; name: string };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  itemId: string;          // exclude this folder from list (can't move into itself)
  itemType: "file" | "folder";
  currentFolderId: string | null; // where the item currently lives
  onMove: (targetFolderId: string | null) => Promise<void>;
};

export const MoveDialog = ({
  open,
  onOpenChange,
  itemName,
  itemId,
  itemType,
  currentFolderId,
  onMove,
}: Props) => {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [folders,  setFolders]  = useState<FolderNode[]>([]);
  const [crumbs,   setCrumbs]   = useState<Crumb[]>([{ id: null, name: "My Drive" }]);
  const [loading,  setLoading]  = useState(false);
  const [moving,   setMoving]   = useState(false);

  const navFolderId = crumbs[crumbs.length - 1].id; // where user has navigated to

  // Fetch folders whenever the dialog opens or the user navigates
  useEffect(() => {
    if (!open || !userId) return;
    setLoading(true);
    const params = new URLSearchParams({ userId });
    if (navFolderId) params.set("parentId", navFolderId);

    fetch(`/api/folder?${params}`)
      .then((r) => r.json())
      .then((data) => {
        // Filter out the item being moved (a folder can't contain itself)
        const list: FolderNode[] = (data.folders ?? []).filter(
          (f: FolderNode) => f._id !== itemId
        );
        setFolders(list);
      })
      .catch(() => setFolders([]))
      .finally(() => setLoading(false));
  }, [open, navFolderId, userId, itemId]);

  const navigateInto = (folder: FolderNode) =>
    setCrumbs((prev) => [...prev, { id: folder._id, name: folder.name }]);

  const navigateTo = (index: number) =>
    setCrumbs((prev) => prev.slice(0, index + 1));

  const handleClose = () => {
    onOpenChange(false);
    setCrumbs([{ id: null, name: "My Drive" }]);
  };

  const handleMove = async () => {
    setMoving(true);
    try {
      await onMove(navFolderId);
      handleClose();
    } finally {
      setMoving(false);
    }
  };

  // Disable "Move Here" if the user hasn't moved away from the item's current folder
  const isSameLocation = navFolderId === (currentFolderId ?? null);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="truncate">
            Move &ldquo;{itemName}&rdquo;
          </DialogTitle>
        </DialogHeader>

        {/* Breadcrumb navigation */}
        <div className="flex items-center gap-1 flex-wrap text-sm px-1 min-h-[24px]">
          {crumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight size={13} className="text-muted-foreground/40 shrink-0" />}
              <button
                onClick={() => navigateTo(i)}
                className={`flex items-center gap-1 transition-colors rounded px-1 py-0.5
                  ${i === crumbs.length - 1
                    ? "text-foreground font-medium pointer-events-none"
                    : "text-muted-foreground hover:text-foreground hover:underline"
                  }`}
              >
                {i === 0 && <HardDrive size={13} className="shrink-0" />}
                {crumb.name}
              </button>
            </span>
          ))}
        </div>

        {/* Folder browser */}
        <div className="border border-border rounded-xl overflow-hidden min-h-[200px] max-h-60 overflow-y-auto bg-muted/20">
          {loading ? (
            <div className="flex items-center justify-center h-[200px]">
              <Loader2 size={22} className="animate-spin text-muted-foreground" />
            </div>
          ) : folders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[200px] gap-2 text-center">
              <Folder size={30} className="text-muted-foreground/25" />
              <p className="text-sm text-muted-foreground">No sub-folders here</p>
              <p className="text-xs text-muted-foreground/60">
                You can still move the item to this location
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {folders.map((folder) => (
                <li key={folder._id}>
                  <button
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-left group"
                    onClick={() => navigateInto(folder)}
                  >
                    <div className="p-1.5 bg-yellow-500/15 text-yellow-500 rounded-lg shrink-0">
                      <Folder size={15} />
                    </div>
                    <span className="text-sm text-foreground flex-1 truncate">
                      {folder.name}
                    </span>
                    <ChevronRight
                      size={15}
                      className="text-muted-foreground/40 shrink-0 group-hover:text-muted-foreground transition-colors"
                    />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={moving}>
            Cancel
          </Button>
          <Button onClick={handleMove} disabled={isSameLocation || moving}>
            {moving ? (
              <>
                <Loader2 size={14} className="mr-2 animate-spin" />
                Moving…
              </>
            ) : (
              "Move Here"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
