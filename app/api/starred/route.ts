// app/api/starred/route.ts

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

  const folders = await Folder.find({ userId, isStarred: true, isTrashed: { $ne: true } }).sort({ updatedAt: -1 }).skip(skip).limit(LIMIT);
  const files = await File.find({ userId, isStarred: true, isTrashed: { $ne: true } }).sort({ updatedAt: -1 }).skip(skip).limit(LIMIT);

  return NextResponse.json({
    folders: JSON.parse(JSON.stringify(folders)),
    files: JSON.parse(JSON.stringify(files)),
    hasMore: folders.length === LIMIT || files.length === LIMIT,
  });
}
