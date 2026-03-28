// lib/context/DriveContext.tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

type DriveInitialData = {
  user: any;
  folders: any[];
  files: any[];
  currentFolderId: string | null;
};

type DriveContextValue = {
  user: any;
  folders: any[];
  files: any[];
  currentFolderId: string | null;
  isSyncing: boolean;
  setFolders: Dispatch<SetStateAction<any[]>>;
  setFiles: Dispatch<SetStateAction<any[]>>;
  refreshDriveData: (parentId: string | null) => Promise<void>;
};

const DriveContext = createContext<DriveContextValue | null>(null);

export const DriveProvider = ({
  children,
  initialData,
}: {
  children: ReactNode;
  initialData: DriveInitialData;
}) => {
  const [folders, setFolders] = useState<DriveInitialData["folders"]>(
    initialData.folders
  );
  const [files, setFiles] = useState<DriveInitialData["files"]>(initialData.files);
  const [currentFolderId, setCurrentFolderId] = useState<DriveInitialData["currentFolderId"]>(
    initialData.currentFolderId ?? null
  );
  const [isSyncing, setIsSyncing] = useState(false);

  const refreshDriveData = useCallback(
    async (parentId: string | null) => {
      const userId = initialData.user?.id;
      if (!userId) return;

      setIsSyncing(true);
      try {
        const qs = new URLSearchParams();
        qs.set("userId", String(userId));
        // API route treats empty string as "root"
        qs.set("parentId", parentId ?? "");

        const res = await fetch(`/api/folder?${qs.toString()}`, {
          cache: "no-store",
        });
        if (!res.ok) {
          throw new Error(`Failed to load folder contents (${res.status})`);
        }

        const data = await res.json();
        setFolders(Array.isArray(data?.folders) ? data.folders : []);
        setFiles(Array.isArray(data?.files) ? data.files : []);
        setCurrentFolderId(parentId ?? null);

        // Update lastAccessedAt for the opened folder
        if (parentId) {
          fetch(`/api/folder/${parentId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lastAccessedAt: new Date().toISOString() }),
          });
        }
      } finally {
        setIsSyncing(false);
      }
    },
    [initialData.user?.id]
  );

  // Important: `useState(initialData...)` only initializes once.
  // When navigating between `/?folderId=...`, keep state in sync
  // so the UI updates to the new folder.
  useEffect(() => {
    setFolders(initialData.folders);
    setFiles(initialData.files);
    setCurrentFolderId(initialData.currentFolderId ?? null);
  }, [initialData.currentFolderId, initialData.folders, initialData.files]);

  const value = useMemo<DriveContextValue>(
    () => ({
      user: initialData.user,
      folders,
      files,
      currentFolderId,
      isSyncing,
      setFolders,
      setFiles,
      refreshDriveData,
    }),
    [
      initialData.user,
      folders,
      files,
      currentFolderId,
      isSyncing,
      refreshDriveData,
    ]
  );

  return <DriveContext.Provider value={value}>{children}</DriveContext.Provider>;
};

export const useDrive = () => {
  const ctx = useContext(DriveContext);
  if (!ctx) throw new Error("useDrive must be used within DriveProvider");
  return ctx;
};