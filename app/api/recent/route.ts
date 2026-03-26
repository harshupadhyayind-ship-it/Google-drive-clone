// app/api/recent/route.ts

import { connectDB } from "@/lib/db/connect";
import { Folder } from "@/lib/db/models/Folder";
import { File } from "@/lib/db/models/File";
import { NextResponse } from "next/server";

const LIMIT = 20;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const skip = (page - 1) * LIMIT;

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  await connectDB();

  const folders = await Folder.find({
    userId,
    isTrashed: { $ne: true },
    lastAccessedAt: { $ne: null },
  }).sort({ lastAccessedAt: -1 }).skip(skip).limit(LIMIT);

  const files = await File.find({
    userId,
    isTrashed: { $ne: true },
    lastAccessedAt: { $ne: null },
  }).sort({ lastAccessedAt: -1 }).skip(skip).limit(LIMIT);

  const all = [
    ...JSON.parse(JSON.stringify(folders)).map((f: any) => ({ ...f, type: "folder" })),
    ...JSON.parse(JSON.stringify(files)).map((f: any) => ({ ...f, type: "file" })),
  ].sort((a, b) => new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime());

  return NextResponse.json({
    items: all,
    hasMore: folders.length === LIMIT || files.length === LIMIT,
  });
}
