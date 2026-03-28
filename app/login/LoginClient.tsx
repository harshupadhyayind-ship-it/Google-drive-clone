"use client";

import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { Input } from "@/lib/ui/components/Input";
import { Button } from "@/lib/ui/components/Button";


type FormData = {
  email: string;
  password: string;
};

export default function LoginClient() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    const res = await signIn("credentials", {
      ...data,
      redirect: false,
    });

    if (res?.error) {
      alert("Invalid credentials");
      return;
    }

    const sessionRes = await fetch("/api/auth/session");
    const session = await sessionRes.json();

    if (session.user.role === "admin") {
      window.location.href = "/admin";
    } else {
      window.location.href = "/dashboard";
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md space-y-4 p-8 bg-card border border-border rounded-2xl shadow-2xl"
      >
        <div className="flex justify-center mb-2">
          <Image src="/logo.svg" alt="NovaDrive" width={180} height={45} priority />
        </div>
        <h1 className="text-lg font-semibold text-center text-foreground">Welcome back</h1>
        <p className="text-xs text-center text-muted-foreground -mt-2">Sign in to your NovaDrive account</p>

        {/* Email */}
        <div>
          <Input
            placeholder="Email"
            {...register("email", {
              required: "Email is required",
            })}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <Input
            type="password"
            placeholder="Password"
            {...register("password", {
              required: "Password is required",
            })}
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Login Button */}
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </Button>

        {/* Divider */}
        <div className="text-center text-sm text-muted-foreground">
          OR
        </div>

        {/* Google Button */}
        <Button
          type="button"
          variant="outline"
          className="w-full dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10 dark:text-foreground"
          onClick={() =>
            signIn("google", { callbackUrl: "/dashboard" })
          }
        >
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </Button>
      </form>
    </div>
  );
}