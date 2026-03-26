// app/(user)/dashboard/recent/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { RecentContent } from "@/lib/ui/drive/RecentContent";
import { getRecentData } from "@/lib/services/drive";

export default async function RecentPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const { items } = await getRecentData(userId);

  return <RecentContent initialItems={items} />;
}
