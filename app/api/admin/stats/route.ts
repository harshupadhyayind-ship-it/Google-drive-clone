import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";
import { File } from "@/lib/db/models/File";
import { Folder } from "@/lib/db/models/Folder";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  const [totalUsers, totalFiles, totalFolders, recentUsers, recentFiles] = await Promise.all([
    User.countDocuments(),
    File.countDocuments({ isTrashed: { $ne: true } }),
    Folder.countDocuments({ isTrashed: { $ne: true } }),
    User.find().sort({ createdAt: -1 }).limit(5).select("name email role createdAt"),
    File.find({ isTrashed: { $ne: true } })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("userId", "name email"),
  ]);

  return NextResponse.json({
    totalUsers,
    totalFiles,
    totalFolders,
    recentUsers: JSON.parse(JSON.stringify(recentUsers)),
    recentFiles: JSON.parse(JSON.stringify(recentFiles)),
  });
}
