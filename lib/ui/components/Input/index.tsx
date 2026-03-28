"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { InputProps } from "./types";

export function Input({ className, type, ...props }: InputProps) {
  const [showPassword, setShowPassword] = React.useState(false);

  const isPassword = type === "password";

  return (
    <div className="relative w-full">
      <input
        type={isPassword ? (showPassword ? "text" : "password") : type}
        data-slot="input"
        className={cn(
          "h-10 w-full min-w-0 rounded-lg border border-input bg-muted/30 px-3 py-2 pr-10 text-base text-foreground transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        {...props}
      />

      {/* 👁 Toggle Button */}
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
        >
          {showPassword ? "🙈" : "👁"}
        </button>
      )}
    </div>
  );
}