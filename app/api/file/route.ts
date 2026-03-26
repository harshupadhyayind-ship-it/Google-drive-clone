import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

import { connectDB } from "@/lib/db/connect";
import { File } from "@/lib/db/models/File";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;
    const folderId = formData.get("folderId") as string;

    if (!file || !userId) {
      return NextResponse.json(
        { error: "Missing file or userId" },
        { status: 400 }
      );
    }

    // Convert file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileName = `${Date.now()}-${file.name}`;

    const filePath = path.join(process.cwd(), "public/uploads", fileName);

    // Save file locally
    await writeFile(filePath, buffer);

    await connectDB();

    const savedFile = await File.create({
      name: file.name,
      url: `/uploads/${fileName}`,
      size: file.size,
      userId,
      folderId: folderId || null,
      lastAccessedAt: new Date(),
    });

    return NextResponse.json(savedFile);
  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}