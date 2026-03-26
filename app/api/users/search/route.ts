import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  await connectDB();

  const users = await User.find({
    _id: { $ne: session.user.id }, // exclude self
    $or: [
      { name: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
    ],
  })
    .select("name email")
    .limit(6);

  return NextResponse.json(JSON.parse(JSON.stringify(users)));
}
