"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm space-y-4 p-6 bg-white border rounded-xl shadow-sm"
      >
        <h1 className="text-xl font-semibold text-center">
          Create Account
        </h1>

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
        <p className="text-xs text-center text-gray-500">
          Already have an account?{" "}
          <span
            className="text-blue-600 cursor-pointer"
            onClick={() => router.push("/login")}
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
}