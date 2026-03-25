// app/api/starred/route.ts

import { connectDB } from "@/lib/db/connect";
import { Folder } from "@/lib/db/models/Folder";
import { File } from "@/lib/db/models/File";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  await connectDB();

  const folders = await Folder.find({ userId, isStarred: true, isTrashed: { $ne: true } }).sort({ updatedAt: -1 });
  const files = await File.find({ userId, isStarred: true, isTrashed: { $ne: true } }).sort({ updatedAt: -1 });

  return NextResponse.json({
    folders: JSON.parse(JSON.stringify(folders)),
    files: JSON.parse(JSON.stringify(files)),
  });
}
