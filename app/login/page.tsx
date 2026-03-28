import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import LoginClient from "./LoginClient";

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in to your VegaDrive account and access your files from anywhere, on any device.",
  openGraph: {
    title: "Sign In | VegaDrive",
    description: "Sign in to access your secure cloud storage.",
  },
};

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  // server-side redirect
  if (session?.user) {
    if (session.user.role === "admin") {
      redirect("/overview");
    } else {
      redirect("/");
    }
  }

  return <LoginClient />;
}