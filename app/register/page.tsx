import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import RegisterClient from "./RegisterClient";

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