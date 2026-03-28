import { connectDB } from "@/lib/db/connect";
import { File } from "@/lib/db/models/File";
import { FilesContent } from "@/lib/ui/admin/FilesContent";

const LIMIT = 20;

async function getInitialFiles() {
  await connectDB();

  const [files, total] = await Promise.all([
    File.find({ isTrashed: { $ne: true } })
      .sort({ createdAt: -1 })
      .limit(LIMIT)
      .populate("userId", "name email"),
    File.countDocuments({ isTrashed: { $ne: true } }),
  ]);

  return {
    files: JSON.parse(JSON.stringify(files)),
    total,
  };
}

export default async function FilesPage() {
  const { files, total } = await getInitialFiles();
  return <FilesContent initialFiles={files} initialTotal={total} />;
}
