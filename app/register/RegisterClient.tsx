"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Input } from "@/lib/ui/components/Input";
import { Button } from "@/lib/ui/components/Button";

type FormData = {
  name: string;
  email: string;
  password: string;
};

export default function RegisterClient() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    const res = await fetch("/api/register", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      alert("User already exists");
      return;
    }

    router.push("/login");
  };

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
        <p className="text-xs text-center text-muted-foreground -mt-2">Join VegaDrive — free forever</p>

        {/* Name */}
        <div>
          <Input
            placeholder="Full Name"
            {...register("name", {
              required: "Name is required",
            })}
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <Input
            placeholder="Email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^\S+@\S+$/i,
                message: "Invalid email",
              },
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
              minLength: {
                value: 3,
                message: "Minimum 3 characters",
              },
            })}
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating..." : "Register"}
        </Button>

        {/* Footer */}
        <p className="text-xs text-center text-slate-500">
          Already have an account?{" "}
          <span
            className="text-purple-400 hover:text-purple-300 cursor-pointer"
            onClick={() => router.push("/login")}
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
}