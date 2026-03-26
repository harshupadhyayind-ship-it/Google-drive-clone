import { connectDB } from "@/lib/db/connect";
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
  const showTrashed = searchParams.get("trashed") === "true";
  const skip = (page - 1) * LIMIT;

  await connectDB();

  const query: any = {};
  if (q) query.name = { $regex: q, $options: "i" };
  if (!showTrashed) query.isTrashed = { $ne: true };
  else query.isTrashed = true;

  const [files, total] = await Promise.all([
    File.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(LIMIT)
      .populate("userId", "name email"),
    File.countDocuments(query),
  ]);

  return NextResponse.json({
    files: JSON.parse(JSON.stringify(files)),
    total,
    hasMore: skip + LIMIT < total,
  });
}
