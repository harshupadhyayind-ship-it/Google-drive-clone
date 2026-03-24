// app/(user)/layout.tsx
import { Sidebar } from "@/lib/ui/layout/Sidebar";
import { Navbar } from "@/lib/ui/layout/Navbar";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { DriveProvider } from "@/lib/context/DriveContext";
import { getDriveData } from "@/lib/services/drive";

export default async function UserLayout({ children, searchParams }: { children: React.ReactNode, searchParams: Promise<{ folderId?: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const params = await searchParams;

  const userId = session?.user?.id;
  const parentId = params?.folderId || null;

  const { folders, files } = await getDriveData(userId, parentId);

  return (
    <div className="flex h-screen">
      <DriveProvider
        initialData={{
          user: session.user,
          folders,
          files,
          currentFolderId: parentId,
        }}
      >

        <Sidebar userId={session.user?.id} />

        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="p-4 overflow-auto">{children}</main>
        </div>
      </DriveProvider>
    </div>
  );
}