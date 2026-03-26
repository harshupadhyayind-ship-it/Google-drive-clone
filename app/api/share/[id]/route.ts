import { connectDB } from "@/lib/db/connect";
import { Share } from "@/lib/db/models/Share";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Public — get share info by token (for /share/[token] page)
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await connectDB();

  const share = await Share.findOne({ token: id, shareType: "public" });
  if (!share) {
    return NextResponse.json({ error: "Share not found" }, { status: 404 });
  }

  return NextResponse.json(JSON.parse(JSON.stringify(share)));
}

// Delete (revoke) a share by its _id — works for both public and user shares
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await connectDB();

  // Try by _id first, fallback to token
  let share = null;
  try {
    share = await Share.findById(id);
  } catch {}
  if (!share) {
    share = await Share.findOne({ token: id });
  }

  if (!share) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (share.ownerId.toString() !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await Share.findByIdAndDelete(share._id);
  return NextResponse.json({ success: true });
}
