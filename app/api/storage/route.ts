import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db/connect";
import { File } from "@/lib/db/models/File";
import mongoose from "mongoose";

const TOTAL_BYTES = 10 * 1024 * 1024; // 10 MB

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  // Convert string id → ObjectId so the $match type aligns with the stored field
  const userObjectId = new mongoose.Types.ObjectId(session.user.id);

  const result = await File.aggregate([
    { $match: { userId: userObjectId, isTrashed: { $ne: true } } },
    { $group: { _id: null, total: { $sum: { $toDouble: "$size" } } } },
  ]);

  const usedBytes: number = result[0]?.total ?? 0;

  return NextResponse.json({
    usedBytes,
    totalBytes: TOTAL_BYTES,
    usedMB: +(usedBytes / (1024 * 1024)).toFixed(2),
    totalMB: 10,
    percent: Math.min(100, Math.round((usedBytes / TOTAL_BYTES) * 100)),
  });
}
