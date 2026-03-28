// app/(user)/page.tsx

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { DashboardContent } from "@/lib/ui/drive/DashboardContent";
import { getServerSession } from "next-auth";

export default async function DashboardPage() {

  

  return (
    <DashboardContent />
  );
}