// app/api/file/[id]/route.ts

import { connectDB } from "@/lib/db/connect";
import { File } from "@/lib/db/models/File";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  await connectDB();

  await File.findByIdAndDelete(params.id);

  return NextResponse.json({ success: true });
}