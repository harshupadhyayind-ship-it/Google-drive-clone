// lib/utils/fileIcon.ts

import {
  FileText,
  FileImage,
  FileSpreadsheet,
  FileCode,
  File,
} from "lucide-react";

export const getFileIcon = (fileName: string) => {
  const ext = fileName.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "pdf":
      return FileText;

    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "svg":
      return FileImage;

    case "xls":
    case "xlsx":
    case "csv":
      return FileSpreadsheet;

    case "js":
    case "ts":
    case "html":
    case "css":
    case "json":
      return FileCode;

    default:
      return File;
  }
};