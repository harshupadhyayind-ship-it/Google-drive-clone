import { connectDB } from "@/lib/db/connect";
import { Folder } from "@/lib/db/models/Folder";
import { File } from "@/lib/db/models/File";

export async function getDriveData(userId: string, parentId: string | null) {
  await connectDB();

  const folders = await Folder.find({
    userId,
    parentId,
  }).sort({ createdAt: -1 });

  const files = await File.find({
    userId,
    folderId: parentId,
  }).sort({ createdAt: -1 });

  return {
    folders: JSON.parse(JSON.stringify(folders)),
    files: JSON.parse(JSON.stringify(files)),
  };
}

// export async function uploadFile({
//   file,
//   userId,
//   folderId,
// }: {
//   file: File;
//   userId: string;
//   folderId?: string | null;
// }) {
//   const formData = new FormData();
//   formData.append("file", file);
//   formData.append("userId", userId);
//   formData.append("folderId", folderId || "");

//   const res = await fetch("/api/file", {
//     method: "POST",
//     body: formData,
//   });

//   if (!res.ok) {
//     throw new Error("Upload failed");
//   }

//   return res.json();
// }

// export async function createFolder({
//   name,
//   userId,
//   parentId,
// }: {
//   name: string;
//   userId: string;
//   parentId?: string | null;
// }) {
//   const res = await fetch("/api/folder", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       name,
//       userId,
//       parentId,
//     }),
//   });

//   if (!res.ok) {
//     throw new Error("Folder creation failed");
//   }

//   return res.json();
// }

