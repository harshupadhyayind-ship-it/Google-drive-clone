import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { File } from "@/lib/db/models/File";
import { uploadToS3 } from "@/lib/s3";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as globalThis.File;
    const userId = formData.get("userId") as string;
    const folderId = formData.get("folderId") as string;

    if (!file || !userId) {
      return NextResponse.json({ error: "Missing file or userId" }, { status: 400 });
    }

    const MAX_SIZE = 100 * 1024 * 1024; // 100 MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 100 MB" },
        { status: 413 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Unique key: uploads/<userId>/<timestamp>-<filename>
    const key = `uploads/${userId}/${Date.now()}-${file.name.replace(/\s+/g, "_")}`;

    const url = await uploadToS3(buffer, key, file.type || "application/octet-stream");

    await connectDB();

    const savedFile = await File.create({
      name: file.name,
      url,
      size: file.size,
      userId,
      folderId: folderId || null,
      lastAccessedAt: new Date(),
    });

    return NextResponse.json(savedFile);
  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
