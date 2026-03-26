import { connectDB } from "@/lib/db/connect";
import { Share } from "@/lib/db/models/Share";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const shares = await Share.find({
    sharedWithUserId: session.user.id,
    shareType: "user",
  })
    .populate({ path: "ownerId", select: "name email", strictPopulate: false })
    .sort({ createdAt: -1 });

  return NextResponse.json(JSON.parse(JSON.stringify(shares)));
}
