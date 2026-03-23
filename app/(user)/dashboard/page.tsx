import { FolderCard } from "@/lib/ui/drive/FolderCard";
import { FileCard } from "@/lib/ui/drive/FileCard";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getDriveData } from "@/lib/services/drive";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ folderId?: string }>;
}) {
  const params = await searchParams;

  const session = await getServerSession(authOptions);

  const userId = session?.user?.id;
  const parentId = params?.folderId || null;

  
  if (!userId) {
    return <div>Not authenticated</div>;
  }
  
  const { folders, files } = await getDriveData(userId, parentId);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">My Drive</h1>

      {/* 📁 Folders */}
      <section>
        <h2 className="mb-3 text-sm font-medium text-gray-600">
          Folders
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {folders.length === 0 && (
            <p className="text-sm text-gray-400">No folders</p>
          )}

          {folders.map((folder: any) => (
            <a
              key={folder._id}
              href={`/dashboard?folderId=${folder._id}`}
            >
              <FolderCard name={folder.name} />
            </a>
          ))}
        </div>
      </section>

      {/* 📄 Files */}
      <section>
        <h2 className="mb-3 text-sm font-medium text-gray-600">
          Files
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {files.length === 0 && (
            <p className="text-sm text-gray-400">No files</p>
          )}

          {files.map((file: any) => (
            <a key={file._id} href={file.url} target="_blank">
              <FileCard name={file.name} />
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}