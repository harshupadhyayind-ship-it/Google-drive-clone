import { connectDB } from "@/lib/db/connect";
import { Folder } from "@/lib/db/models/Folder";
import { File } from "@/lib/db/models/File";

export async function getStarredData(userId: string) {
  await connectDB();

  const folders = await Folder.find({ userId, isStarred: true, isTrashed: false }).sort({ updatedAt: -1 });
  const files = await File.find({ userId, isStarred: true, isTrashed: false }).sort({ updatedAt: -1 });

  return {
    folders: JSON.parse(JSON.stringify(folders)),
    files: JSON.parse(JSON.stringify(files)),
  };
}

export async function getRecentData(userId: string) {
  await connectDB();

  const folders = await Folder.find({
    userId,
    isTrashed: false,
    lastAccessedAt: { $ne: null },
  })
    .sort({ lastAccessedAt: -1 })
    .limit(20);

  const files = await File.find({
    userId,
    isTrashed: false,
    lastAccessedAt: { $ne: null },
  })
    .sort({ lastAccessedAt: -1 })
    .limit(20);

  // Merge and sort by lastAccessedAt, keep top 20
  const all = [
    ...JSON.parse(JSON.stringify(folders)).map((f: any) => ({ ...f, type: "folder" })),
    ...JSON.parse(JSON.stringify(files)).map((f: any) => ({ ...f, type: "file" })),
  ].sort((a, b) => new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime())
    .slice(0, 20);

  return { items: all };
}

export async function getTrashData(userId: string) {
  await connectDB();

  const folders = await Folder.find({ userId, isTrashed: true }).sort({ trashedAt: -1 });
  const files = await File.find({ userId, isTrashed: true }).sort({ trashedAt: -1 });

  return {
    folders: JSON.parse(JSON.stringify(folders)),
    files: JSON.parse(JSON.stringify(files)),
  };
}

export async function getDriveData(userId: string, parentId: string | null) {
  await connectDB();

  const folders = await Folder.find({
    userId,
    parentId,
    isTrashed: { $ne: true },
  }).sort({ createdAt: -1 });

  const files = await File.find({
    userId,
    folderId: parentId,
    isTrashed: { $ne: true },
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

