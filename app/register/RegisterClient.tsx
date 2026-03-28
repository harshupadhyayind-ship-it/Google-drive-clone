"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Mail, ArrowLeft, RefreshCw } from "lucide-react";
import { Input } from "@/lib/ui/components/Input";
import { Button } from "@/lib/ui/components/Button";

type FormData = {
  name: string;
  email: string;
  password: string;
};

export default function RegisterClient() {
  const router = useRouter();
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setServerError(body.error ?? "Something went wrong");
      return;
    }

    setSentTo(data.email);
  };

  const handleResend = async () => {
    setResending(true);
    setResent(false);
    const { email, name, password } = getValues();
    await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, password }),
    });
    setResending(false);
    setResent(true);
  };

  /* ── "Check your email" screen ─────────────────────────────────── */
  if (sentTo) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md p-8 bg-card border border-border rounded-2xl shadow-2xl text-center space-y-5">
          <div className="flex justify-center">
            <Image src="/logo.svg" alt="VegaDrive" width={160} height={40} priority />
          </div>

          <div className="flex justify-center">
            <div className="p-4 bg-primary/10 rounded-full">
              <Mail size={36} className="text-primary" />
            </div>
          </div>

          <div>
            <h1 className="text-lg font-semibold text-foreground">Check your inbox</h1>
            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
              We&apos;ve sent a verification link to{" "}
              <span className="font-medium text-foreground">{sentTo}</span>.
              Click the link in the email to activate your account.
            </p>
          </div>

          <div className="bg-muted/40 rounded-xl p-4 text-left space-y-1.5">
            <p className="text-xs font-medium text-foreground">Didn&apos;t get the email?</p>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li>Check your spam / junk folder</li>
              <li>Make sure you entered the right address</li>
              <li>The link expires in 24 hours</li>
            </ul>
          </div>

          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={handleResend}
            disabled={resending}
          >
            <RefreshCw size={14} className={resending ? "animate-spin" : ""} />
            {resent ? "Email resent!" : resending ? "Resending…" : "Resend verification email"}
          </Button>

          <button
            onClick={() => router.push("/login")}
            className="flex items-center justify-center gap-1.5 w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={14} />
            Back to login
          </button>
        </div>
      </div>
    );
  }

  /* ── Registration form ─────────────────────────────────────────── */
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md space-y-4 p-8 bg-card border border-border rounded-2xl shadow-2xl"
      >
        <div className="flex justify-center mb-2">
          <Image src="/logo.svg" alt="VegaDrive" width={180} height={45} priority />
        </div>
        <h1 className="text-lg font-semibold text-center text-foreground">
          Create Account
        </h1>
        <p className="text-xs text-center text-muted-foreground -mt-2">
          Join VegaDrive — free forever
        </p>

        {/* Server error */}
        {serverError && (
          <p className="text-sm text-destructive text-center bg-destructive/10 rounded-lg px-3 py-2">
            {serverError}
          </p>
        )}

        {/* Name */}
        <div>
          <Input
            placeholder="Full Name"
            {...register("name", { required: "Name is required" })}
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <Input
            placeholder="Email"
            {...register("email", {
              required: "Email is required",
              pattern: { value: /^\S+@\S+$/i, message: "Invalid email" },
            })}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <Input
            type="password"
            placeholder="Password"
            {...register("password", {
              required: "Password is required",
              minLength: { value: 8, message: "Minimum 8 characters" },
            })}
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating account…" : "Create Account"}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary font-medium hover:underline underline-offset-4"
          >
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
