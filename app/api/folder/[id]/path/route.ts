// app/api/folder/[id]/path/route.ts
// Returns the full ancestor chain from root → current folder.
// e.g. [{ id: null, name: "My Drive" }, { id: "abc", name: "Projects" }, { id: "xyz", name: "Design" }]

import { connectDB } from "@/lib/db/connect";
import { Folder } from "@/lib/db/models/Folder";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await connectDB();

  const chain: { id: string | null; name: string }[] = [];
  let currentId: string | null = id;

  // Walk up the parent chain (max 20 levels to guard against cycles)
  for (let depth = 0; depth < 20 && currentId; depth++) {
    const folder = await Folder.findById(currentId)
      .select("name parentId")
      .lean() as any;

    if (!folder) break;
    chain.unshift({ id: currentId, name: folder.name });
    currentId = folder.parentId ?? null;
  }

  // Prepend the drive root
  chain.unshift({ id: null, name: "My Drive" });

  return NextResponse.json(chain);
}
