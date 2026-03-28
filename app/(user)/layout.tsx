// app/(user)/layout.tsx
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { DriveProvider } from "@/lib/context/DriveContext";
import { getDriveData } from "@/lib/services/drive";
import { UserLayoutClient } from "@/lib/ui/layout/UserLayoutClient";

// Authenticated pages — never index private user content
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const userId = session?.user?.id;
  const parentId = null;

  const { folders, files } = await getDriveData(userId, parentId);

  return (
    <div className="flex h-screen overflow-hidden">
      <DriveProvider
        initialData={{
          user: session.user,
          folders,
          files,
          currentFolderId: parentId,
        }}
      >
        <UserLayoutClient userId={userId}>
          {children}
        </UserLayoutClient>
      </DriveProvider>
    </div>
  );
}
