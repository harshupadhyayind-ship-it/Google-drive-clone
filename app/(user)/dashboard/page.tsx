// app/(user)/dashboard/page.tsx

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { DashboardContent } from "@/lib/ui/drive/DashboardContent";
import { getServerSession } from "next-auth";

export default async function DashboardPage() {

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) return <div>Not authenticated</div>;


  return (
    <DashboardContent />
  );
}