// app/(admin)/layout.tsx
import type { Metadata } from "next";
import { AdminLayoutClient } from "@/lib/ui/layout/AdminLayoutClient";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

// Admin pages are private — never index
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "admin") {
    redirect("/");
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}