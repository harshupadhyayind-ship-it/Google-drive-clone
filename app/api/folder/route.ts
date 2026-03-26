import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Folder } from "@/lib/db/models/Folder";
import { File } from "@/lib/db/models/File";

// Create Folder
export async function POST(req: Request) {
  const { name, parentId, userId } = await req.json();

  if (!name || !userId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  await connectDB();

  const folder = await Folder.create({
    name,
    userId,
    parentId: parentId || null,
    lastAccessedAt: new Date(),
  });

  return NextResponse.json(folder);
}

// Get Folder Content
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const parentId = searchParams.get("parentId");
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  await connectDB();

  const folders = await Folder.find({
    userId,
    parentId: parentId || null,
    isTrashed: { $ne: true },
  }).sort({ createdAt: -1 });

  const files = await File.find({
    userId,
    folderId: parentId || null,
    isTrashed: { $ne: true },
  }).sort({ createdAt: -1 });

  // Ensure ObjectIds are JSON-serializable.
  return NextResponse.json({
    folders: JSON.parse(JSON.stringify(folders)),
    files: JSON.parse(JSON.stringify(files)),
  });
}