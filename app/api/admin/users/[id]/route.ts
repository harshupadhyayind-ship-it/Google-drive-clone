import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";
import { File } from "@/lib/db/models/File";
import { Folder } from "@/lib/db/models/Folder";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  await connectDB();

  const update: Record<string, any> = {};
  if (body.role !== undefined) update.role = body.role;
  if (body.name !== undefined) update.name = body.name;

  const user = await User.findByIdAndUpdate(id, update, { new: true }).select("-password");
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(JSON.parse(JSON.stringify(user)));
}

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

  await Promise.all([
    User.findByIdAndDelete(id),
    File.deleteMany({ userId: id }),
    Folder.deleteMany({ userId: id }),
  ]);

  return NextResponse.json({ success: true });
}
