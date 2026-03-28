import type { Metadata } from "next";

export const metadata: Metadata = { title: "Folders" };

import { connectDB } from "@/lib/db/connect";
import { Folder } from "@/lib/db/models/Folder";
import { FoldersContent } from "@/lib/ui/admin/FoldersContent";

const LIMIT = 20;

async function getInitialFolders() {
  await connectDB();

  const [folders, total] = await Promise.all([
    Folder.find({ isTrashed: { $ne: true } })
      .sort({ createdAt: -1 })
      .limit(LIMIT)
      .populate("userId", "name email"),
    Folder.countDocuments({ isTrashed: { $ne: true } }),
  ]);

  return {
    folders: JSON.parse(JSON.stringify(folders)),
    total,
  };
}

export default async function FoldersPage() {
  const { folders, total } = await getInitialFolders();
  return <FoldersContent initialFolders={folders} initialTotal={total} />;
}
