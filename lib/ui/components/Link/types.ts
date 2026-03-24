// lib/ui/components/Link/types.ts

import { LinkProps as NextLinkProps } from "next/link";
import { ReactNode } from "react";

export type LinkVariant =
  | "default"
  | "primary"
  | "secondary"
  | "ghost"
  | "underline";

export type LinkSize = "sm" | "md" | "lg";

export interface AppLinkProps extends NextLinkProps {
  children: ReactNode;
  className?: string;
  variant?: LinkVariant;
  size?: LinkSize;
  external?: boolean;
}