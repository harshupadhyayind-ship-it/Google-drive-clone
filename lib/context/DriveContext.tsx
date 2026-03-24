// lib/context/DriveContext.tsx
"use client";

import { createContext, useContext, useState } from "react";

const DriveContext = createContext<any>(null);

export const DriveProvider = ({ children, initialData }: any) => {
  const [folders, setFolders] = useState(initialData.folders);
  const [files, setFiles] = useState(initialData.files);

  return (
    <DriveContext.Provider
      value={{
        user: initialData.user,
        folders,
        files,
        currentFolderId: initialData.currentFolderId,
        setFolders,
        setFiles,
      }}
    >
      {children}
    </DriveContext.Provider>
  );
};

export const useDrive = () => useContext(DriveContext);