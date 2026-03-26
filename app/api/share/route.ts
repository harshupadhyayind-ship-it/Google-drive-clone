import { connectDB } from "@/lib/db/connect";
import { Share } from "@/lib/db/models/Share";
import { File } from "@/lib/db/models/File";
import { Folder } from "@/lib/db/models/Folder";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { randomBytes } from "crypto";

// Create share (public link or user share)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { itemId, itemType, shareType, sharedWithUserId } = await req.json();

  if (!itemId || !itemType || !shareType) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  await connectDB();

  // Look up item
  let itemName = "";
  let url: string | null = null;
  if (itemType === "file") {
    const file = await File.findById(itemId);
    if (!file) return NextResponse.json({ error: "Not found" }, { status: 404 });
    itemName = file.name;
    url = file.url;
  } else {
    const folder = await Folder.findById(itemId);
    if (!folder) return NextResponse.json({ error: "Not found" }, { status: 404 });
    itemName = folder.name;
  }

  if (shareType === "public") {
    // Return existing public share or create one
    const existing = await Share.findOne({ itemId, shareType: "public" });
    if (existing) return NextResponse.json(JSON.parse(JSON.stringify(existing)));

    const token = randomBytes(16).toString("hex");
    const share = await Share.create({
      token, itemId, itemType, itemName, url,
      ownerId: session.user.id, shareType: "public",
    });
    return NextResponse.json(JSON.parse(JSON.stringify(share)));
  }

  if (shareType === "user") {
    if (!sharedWithUserId) {
      return NextResponse.json({ error: "Missing sharedWithUserId" }, { status: 400 });
    }
    // Prevent duplicate
    const existing = await Share.findOne({ itemId, shareType: "user", sharedWithUserId });
    if (existing) return NextResponse.json(JSON.parse(JSON.stringify(existing)));

    const share = await Share.create({
      itemId, itemType, itemName, url,
      ownerId: session.user.id, shareType: "user", sharedWithUserId,
    });
    return NextResponse.json(JSON.parse(JSON.stringify(share)));
  }

  return NextResponse.json({ error: "Invalid shareType" }, { status: 400 });
}

// List all shares for an item
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const itemId = searchParams.get("itemId");
  if (!itemId) return NextResponse.json({ error: "Missing itemId" }, { status: 400 });

  await connectDB();

  const shares = await Share.find({ itemId, ownerId: session.user.id })
    .populate({ path: "sharedWithUserId", select: "name email", strictPopulate: false });

  return NextResponse.json(JSON.parse(JSON.stringify(shares)));
}
