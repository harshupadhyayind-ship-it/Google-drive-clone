// lib/utils/fileIcon.ts

import {
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FileSpreadsheet,
  FileCode,
  FileArchive,
  FileJson,
  Presentation,
  File,
} from "lucide-react";

export const getFileIcon = (fileName: string) => {
  const ext = fileName?.split(".").pop()?.toLowerCase();

  switch (ext) {
    // Documents
    case "pdf":
    case "doc":
    case "docx":
    case "txt":
    case "rtf":
    case "odt":
      return FileText;

    // Images
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "svg":
    case "webp":
    case "bmp":
    case "ico":
    case "tiff":
      return FileImage;

    // Video
    case "mp4":
    case "mov":
    case "avi":
    case "mkv":
    case "webm":
    case "flv":
    case "wmv":
    case "m4v":
      return FileVideo;

    // Audio
    case "mp3":
    case "wav":
    case "flac":
    case "ogg":
    case "m4a":
    case "aac":
    case "wma":
      return FileAudio;

    // Spreadsheets
    case "xls":
    case "xlsx":
    case "csv":
    case "ods":
      return FileSpreadsheet;

    // Presentations
    case "ppt":
    case "pptx":
    case "odp":
    case "key":
      return Presentation;

    // Archives
    case "zip":
    case "rar":
    case "tar":
    case "gz":
    case "7z":
    case "bz2":
    case "xz":
      return FileArchive;

    // JSON
    case "json":
    case "jsonc":
      return FileJson;

    // Code & markup
    case "js":
    case "ts":
    case "jsx":
    case "tsx":
    case "html":
    case "css":
    case "scss":
    case "py":
    case "rb":
    case "java":
    case "c":
    case "cpp":
    case "go":
    case "rs":
    case "php":
    case "xml":
    case "yaml":
    case "yml":
    case "sh":
    case "bash":
    case "sql":
    case "md":
      return FileCode;

    default:
      return File;
  }
};
