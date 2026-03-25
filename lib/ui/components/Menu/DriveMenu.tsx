"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/lib/ui/components/Menu/dropdown-menu";

import { MoreVertical } from "lucide-react";
import { Button } from "../Button";
import { ReactNode } from "react";

export type MenuItem = {
  label?: string;
  onClick?: () => void;
  icon?: ReactNode;
  variant?: "default" | "destructive";
  separator?: boolean;
  disabled?: boolean;
};

type DriveMenuProps = {
  items: MenuItem[];
  trigger?: ReactNode; // optional custom trigger
};

export const DriveMenu = ({ items, trigger }: DriveMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-44">
        {items.map((item, index) =>
          item.separator ? (
            <DropdownMenuSeparator key={index} />
          ) : (
            <DropdownMenuItem
              key={index}
              onSelect={(e) => {
                e.preventDefault();
                item.onClick?.();
              }}
              disabled={item.disabled}
              className={
                item.variant === "destructive" ? "text-red-500" : ""
              }
            >
              <div className="flex items-center gap-2">
                {item.icon}
                {item.label}
              </div>
            </DropdownMenuItem>
          )
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};