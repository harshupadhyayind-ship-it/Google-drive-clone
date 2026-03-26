// app/api/search/route.ts

import { connectDB } from "@/lib/db/connect";
import { Folder } from "@/lib/db/models/Folder";
import { File } from "@/lib/db/models/File";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const query = searchParams.get("q");

  if (!userId || !query) {
    return NextResponse.json({ error: "Missing userId or query" }, { status: 400 });
  }

  await connectDB();

  const regex = new RegExp(query, "i");

  const folders = await Folder.find({
    userId,
    name: { $regex: regex },
    isTrashed: { $ne: true },
  }).sort({ updatedAt: -1 }).limit(20);

  const files = await File.find({
    userId,
    name: { $regex: regex },
    isTrashed: { $ne: true },
  }).sort({ updatedAt: -1 }).limit(20);

  return NextResponse.json({
    folders: JSON.parse(JSON.stringify(folders)),
    files: JSON.parse(JSON.stringify(files)),
  });
}
