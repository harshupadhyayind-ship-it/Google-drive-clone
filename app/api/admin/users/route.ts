import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";
import { File } from "@/lib/db/models/File";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const LIMIT = 20;

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const q = searchParams.get("q") ?? "";
  const skip = (page - 1) * LIMIT;

  await connectDB();

  const query: any = {};
  if (q) {
    query.$or = [
      { name: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip(skip).limit(LIMIT).select("-password"),
    User.countDocuments(query),
  ]);

  // Get file counts per user
  const userIds = users.map((u: any) => u._id);
  const fileCounts = await File.aggregate([
    { $match: { userId: { $in: userIds }, isTrashed: { $ne: true } } },
    { $group: { _id: "$userId", count: { $sum: 1 } } },
  ]);
  const fileCountMap: Record<string, number> = {};
  fileCounts.forEach((fc: any) => {
    fileCountMap[fc._id.toString()] = fc.count;
  });

  const usersWithCounts = JSON.parse(JSON.stringify(users)).map((u: any) => ({
    ...u,
    fileCount: fileCountMap[u._id] ?? 0,
  }));

  return NextResponse.json({
    users: usersWithCounts,
    total,
    hasMore: skip + LIMIT < total,
  });
}
