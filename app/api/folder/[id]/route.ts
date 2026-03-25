// app/api/folder/[id]/route.ts

import { connectDB } from "@/lib/db/connect";
import { Folder } from "@/lib/db/models/Folder";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await connectDB();
  const body = await req.json();

  const update: Record<string, any> = {};

  if (body.name !== undefined) update.name = body.name;
  if (body.isStarred !== undefined) update.isStarred = body.isStarred;
  if (body.lastAccessedAt !== undefined) update.lastAccessedAt = body.lastAccessedAt;

  if (body.isTrashed !== undefined) {
    update.isTrashed = body.isTrashed;
    update.trashedAt = body.isTrashed ? new Date() : null;
  }

  const folder = await Folder.findByIdAndUpdate(id, update, { new: true });
  return NextResponse.json(folder);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await connectDB();

  await Folder.findByIdAndDelete(id);

  return NextResponse.json({ success: true });
}
