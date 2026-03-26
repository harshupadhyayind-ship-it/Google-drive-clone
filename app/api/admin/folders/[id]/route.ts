import { connectDB } from "@/lib/db/connect";
import { Folder } from "@/lib/db/models/Folder";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  await connectDB();

  // Delete folder and all nested subfolders recursively
  const toDelete = [id];
  const queue = [id];
  while (queue.length > 0) {
    const current = queue.shift()!;
    const children = await Folder.find({ parentId: current }).select("_id");
    for (const child of children) {
      toDelete.push(child._id.toString());
      queue.push(child._id.toString());
    }
  }

  await Folder.deleteMany({ _id: { $in: toDelete } });

  return NextResponse.json({ success: true, deleted: toDelete.length });
}
