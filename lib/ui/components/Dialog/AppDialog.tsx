"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "./dialog";
import { Button } from "../Button";

type AppDialogProps = {
  triggerText?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
};

export const AppDialog = ({
  triggerText = "Open Dialog",
  title,
  description,
  children,
  footer,
}: AppDialogProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>{triggerText}</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>

        {children}

        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
};