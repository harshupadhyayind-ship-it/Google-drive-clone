// app/api/recent/route.ts

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

  const folders = await Folder.find({
    userId,
    isTrashed: { $ne: true },
    lastAccessedAt: { $ne: null },
  }).sort({ lastAccessedAt: -1 }).limit(20);

  const files = await File.find({
    userId,
    isTrashed: { $ne: true },
    lastAccessedAt: { $ne: null },
  }).sort({ lastAccessedAt: -1 }).limit(20);

  return NextResponse.json({
    folders: JSON.parse(JSON.stringify(folders)),
    files: JSON.parse(JSON.stringify(files)),
  });
}
