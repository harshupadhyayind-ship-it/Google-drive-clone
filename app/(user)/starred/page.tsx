// app/(user)/starred/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { StarredContent } from "@/lib/ui/drive/StarredContent";
import { getStarredData } from "@/lib/services/drive";

export default async function StarredPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const { folders, files } = await getStarredData(userId);

  return <StarredContent initialFolders={folders} initialFiles={files} />;
}
