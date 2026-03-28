import type { Metadata } from "next";

export const metadata: Metadata = { title: "Trash" };

// app/(user)/trash/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { TrashContent } from "@/lib/ui/drive/TrashContent";

export default async function TrashPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const res = await fetch(
    `${process.env.NEXTAUTH_URL}/api/trash?userId=${userId}`,
    { cache: "no-store" }
  );
  const { folders, files } = await res.json();

  return <TrashContent initialFolders={folders} initialFiles={files} />;
}
