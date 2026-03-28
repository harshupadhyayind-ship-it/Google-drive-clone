// lib/ui/components/Link/LinkClient.tsx
"use client";

import NextLink from "next/link";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { AppLinkProps } from "./types";

const linkVariants = cva(
  "inline-flex items-center transition-colors",
  {
    variants: {
      variant: {
        default: "text-gray-700 hover:text-black",
        primary: "text-blue-600 hover:text-blue-700",
        secondary: "text-gray-500 hover:text-gray-700",
        ghost: "text-muted-foreground hover:bg-muted px-2 py-1 rounded",
        underline: "underline text-blue-600 hover:text-blue-800",
      },
      size: {
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export const LinkClient = ({
  href,
  children,
  className,
  variant,
  size,
  external,
  ...props
}: AppLinkProps) => {
  if (external) {
    return (
      <a
        href={href as string}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(linkVariants({ variant, size }), className)}
      >
        {children}
      </a>
    );
  }

  return (
    <NextLink
      href={href}
      className={cn(linkVariants({ variant, size }), className)}
      {...props}
    >
      {children}
    </NextLink>
  );
};