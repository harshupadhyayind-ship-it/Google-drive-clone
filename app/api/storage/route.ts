import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db/connect";
import { File } from "@/lib/db/models/File";

const TOTAL_BYTES = 100 * 1024 * 1024; // 100 MB

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  // Sum sizes of all non-trashed files for this user
  const result = await File.aggregate([
    { $match: { userId: session.user.id, isTrashed: { $ne: true } } },
    { $group: { _id: null, total: { $sum: { $toLong: "$size" } } } },
  ]);

  const usedBytes: number = result[0]?.total ?? 0;

  return NextResponse.json({
    usedBytes,
    totalBytes: TOTAL_BYTES,
    usedMB: +(usedBytes / (1024 * 1024)).toFixed(2),
    totalMB: 100,
    percent: Math.min(100, Math.round((usedBytes / TOTAL_BYTES) * 100)),
  });
}
