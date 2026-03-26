export const runtime = "nodejs";

import { connectDB } from "@/lib/db/connect";
import { Notification } from "@/lib/db/models/Notification";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET /api/notifications — list recent (newest first) + unread count
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const [notifications, unreadCount] = await Promise.all([
    Notification.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .limit(20),
    Notification.countDocuments({ userId: session.user.id, read: false }),
  ]);

  return NextResponse.json({
    notifications: JSON.parse(JSON.stringify(notifications)),
    unreadCount,
  });
}

// PATCH /api/notifications — mark all as read, or one by id
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const body = await req.json().catch(() => ({}));

  if (body.id) {
    await Notification.findByIdAndUpdate(body.id, { read: true });
  } else {
    await Notification.updateMany(
      { userId: session.user.id, read: false },
      { read: true }
    );
  }

  return NextResponse.json({ success: true });
}
