import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db/connect";
import { Share } from "@/lib/db/models/Share";
import { Folder } from "@/lib/db/models/Folder";
import { File } from "@/lib/db/models/File";
import { SharedFolderContent } from "@/lib/ui/drive/SharedFolderContent";

export default async function SharedFolderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  await connectDB();

  // Verify the user has been granted access to this folder
  const share = await Share.findOne({
    itemId: id,
    shareType: "user",
    sharedWithUserId: session.user.id,
  });

  if (!share) redirect("/dashboard/shared-with-me");

  const [folders, files, folder] = await Promise.all([
    Folder.find({ parentId: id, isTrashed: { $ne: true } }).sort({ createdAt: -1 }).lean(),
    File.find({ folderId: id, isTrashed: { $ne: true } }).sort({ createdAt: -1 }).lean(),
    Folder.findById(id).lean(),
  ]);

  return (
    <SharedFolderContent
      folderName={(folder as any)?.name ?? "Shared Folder"}
      folders={JSON.parse(JSON.stringify(folders))}
      files={JSON.parse(JSON.stringify(files))}
    />
  );
}
