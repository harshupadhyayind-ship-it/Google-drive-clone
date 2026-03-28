import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";

export const metadata: Metadata = { title: "Verify Email" };

// Force dynamic — reads searchParams at request time
export const dynamic = "force-dynamic";

type PageProps = { searchParams: Promise<{ token?: string }> };

type VerifyResult = "success" | "expired" | "invalid" | "missing";

async function verifyToken(token: string): Promise<VerifyResult> {
  await connectDB();

  const user = await User.findOne({ verificationToken: token }).select(
    "+verificationToken +verificationTokenExpiry"
  );

  if (!user) return "invalid";
  if (user.isVerified) return "success"; // already verified

  if (!user.verificationTokenExpiry || user.verificationTokenExpiry < new Date()) {
    return "expired";
  }

  await User.updateOne(
    { _id: user._id },
    {
      $set:   { isVerified: true },
      $unset: { verificationToken: 1, verificationTokenExpiry: 1 },
    }
  );

  return "success";
}

export default async function VerifyEmailPage({ searchParams }: PageProps) {
  const { token } = await searchParams;

  const result: VerifyResult = token ? await verifyToken(token) : "missing";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md p-8 bg-card border border-border rounded-2xl shadow-2xl text-center space-y-4">

        {/* Logo text */}
        <p className="text-xl font-bold text-foreground tracking-tight">⚡ VegaDrive</p>

        {result === "success" && (
          <>
            <div className="flex justify-center">
              <div className="p-4 bg-green-500/10 rounded-full">
                <CheckCircle2 size={36} className="text-green-500" />
              </div>
            </div>
            <h1 className="text-lg font-semibold text-foreground">Email verified!</h1>
            <p className="text-sm text-muted-foreground">
              Your account is now active. You can sign in to VegaDrive.
            </p>
            <Link
              href="/login"
              className="block w-full py-2.5 px-4 rounded-xl bg-primary text-primary-foreground
                text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              Go to login
            </Link>
          </>
        )}

        {result === "expired" && (
          <>
            <div className="flex justify-center">
              <div className="p-4 bg-yellow-500/10 rounded-full">
                <Clock size={36} className="text-yellow-500" />
              </div>
            </div>
            <h1 className="text-lg font-semibold text-foreground">Link expired</h1>
            <p className="text-sm text-muted-foreground">
              This verification link has expired (links are valid for 24 hours).
              Register again to receive a new link.
            </p>
            <Link
              href="/register"
              className="block w-full py-2.5 px-4 rounded-xl bg-primary text-primary-foreground
                text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              Back to register
            </Link>
          </>
        )}

        {(result === "invalid" || result === "missing") && (
          <>
            <div className="flex justify-center">
              <div className="p-4 bg-destructive/10 rounded-full">
                <XCircle size={36} className="text-destructive" />
              </div>
            </div>
            <h1 className="text-lg font-semibold text-foreground">Invalid link</h1>
            <p className="text-sm text-muted-foreground">
              This verification link is invalid or has already been used.
            </p>
            <div className="flex gap-2">
              <Link
                href="/register"
                className="flex-1 py-2.5 px-4 rounded-xl border border-border text-sm font-medium
                  hover:bg-muted transition-colors text-foreground"
              >
                Register
              </Link>
              <Link
                href="/login"
                className="flex-1 py-2.5 px-4 rounded-xl bg-primary text-primary-foreground
                  text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                Login
              </Link>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
