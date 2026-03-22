"use client";

import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
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
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-80 space-y-4 p-6 bg-white border rounded-xl shadow-sm"
      >
        <h1 className="text-xl font-semibold text-center">Login</h1>

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
        <div className="text-center text-sm text-gray-500">
          OR
        </div>

        {/* Google Button (same style) */}
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() =>
            signIn("google", { callbackUrl: "/dashboard" })
          }
        >
          Continue with Google
        </Button>
      </form>
    </div>
  );
}