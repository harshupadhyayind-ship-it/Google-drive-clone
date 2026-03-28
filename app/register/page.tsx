import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import RegisterClient from "./RegisterClient";

export const metadata: Metadata = {
  title: "Create Account",
  description:
    "Create a free VegaDrive account and start storing, organising, and sharing your files securely.",
  openGraph: {
    title: "Create Account | VegaDrive",
    description: "Join VegaDrive — free cloud storage for everyone.",
  },
};

export default async function RegisterPage() {
  const session = await getServerSession(authOptions);

  // ✅ server-side redirect
  if (session?.user) {
    if (session.user.role === "admin") {
      redirect("/overview");
    } else {
      redirect("/");
    }
  }

  return <RegisterClient />;
}