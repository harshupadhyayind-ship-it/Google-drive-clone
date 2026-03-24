// app/api/folder/[id]/route.ts

import { connectDB } from "@/lib/db/connect";
import { Folder } from "@/lib/db/models/Folder";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  await connectDB();

  await Folder.findByIdAndDelete(params.id);

  return NextResponse.json({ success: true });
}