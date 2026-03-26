import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db/connect";
import { Folder } from "@/lib/db/models/Folder";
import { File } from "@/lib/db/models/File";
import { SharedFolderContent } from "@/lib/ui/drive/SharedFolderContent";

export default async function FolderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  await connectDB();

  const [folders, files, folder] = await Promise.all([
    Folder.find({ parentId: id, isTrashed: { $ne: true } }).sort({ createdAt: -1 }).lean(),
    File.find({ folderId: id, isTrashed: { $ne: true } }).sort({ createdAt: -1 }).lean(),
    Folder.findById(id).lean(),
  ]);

  return (
    <SharedFolderContent
      folderName={(folder as any)?.name ?? "Folder"}
      folders={JSON.parse(JSON.stringify(folders))}
      files={JSON.parse(JSON.stringify(files))}
    />
  );
}
