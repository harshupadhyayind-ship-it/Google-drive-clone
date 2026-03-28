import { connectDB } from "@/lib/db/connect";
import { File } from "@/lib/db/models/File";
import { NextResponse } from "next/server";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await connectDB();

  const original = await File.findById(id).lean() as any;
  if (!original) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  // Build a copy name: "report.pdf" → "report (copy).pdf"
  const { name } = original;
  const lastDot   = name.lastIndexOf(".");
  const hasExt    = lastDot > 0;
  const base      = hasExt ? name.slice(0, lastDot) : name;
  const ext       = hasExt ? name.slice(lastDot)    : "";
  const copyName  = `${base} (copy)${ext}`;

  const { _id, createdAt, updatedAt, __v, ...rest } = original;

  const copy = await File.create({
    ...rest,
    name: copyName,
    lastAccessedAt: new Date(),
  });

  return NextResponse.json(copy, { status: 201 });
}
