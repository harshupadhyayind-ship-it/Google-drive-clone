"use client";

// DriveBreadcrumb — used on every drive page.
//
// • Dynamic mode  (pass `folderId`) — fetches ancestor chain from the API so
//   nested folder navigation shows the full path.
// • Static mode   (pass `staticLabel`) — shows "My Drive > Label" instantly,
//   used by Trash, Starred, Recent, Shared with me.

import { useState, useEffect } from "react";
import Link from "next/link";
import { HardDrive, ChevronRight } from "lucide-react";

type Crumb = { id: string | null; name: string };

type Props =
  | { folderId: string | null; staticLabel?: never }
  | { staticLabel: string; folderId?: never };

export const DriveBreadcrumb = ({ folderId, staticLabel }: Props) => {
  const [crumbs, setCrumbs] = useState<Crumb[]>([{ id: null, name: "My Drive" }]);

  useEffect(() => {
    // Static mode — no fetch needed
    if (staticLabel !== undefined) {
      setCrumbs([
        { id: null,   name: "My Drive" },
        { id: "static", name: staticLabel },
      ]);
      return;
    }

    // Dynamic mode — no subfolder, just show root
    if (!folderId) {
      setCrumbs([{ id: null, name: "My Drive" }]);
      return;
    }

    // Dynamic mode — fetch ancestor chain
    fetch(`/api/folder/${folderId}/path`)
      .then((r) => r.json())
      .then((data: Crumb[]) => {
        if (Array.isArray(data) && data.length > 0) setCrumbs(data);
      })
      .catch(() => {});
  }, [folderId, staticLabel]);

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-1 flex-wrap">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          const href =
            crumb.id && crumb.id !== "static"
              ? `/?folderId=${crumb.id}`
              : "/";

          return (
            <li key={i} className="flex items-center gap-1">
              {/* Separator (skip before first item) */}
              {i > 0 && (
                <ChevronRight
                  size={16}
                  className="text-muted-foreground/40 shrink-0"
                  aria-hidden
                />
              )}

              {isLast ? (
                /* Current page — not a link */
                <span
                  aria-current="page"
                  className="flex items-center gap-2 text-2xl font-semibold text-foreground"
                >
                  {i === 0 && (
                    <HardDrive size={20} className="text-primary shrink-0" />
                  )}
                  {crumb.name}
                </span>
              ) : (
                /* Ancestor — clickable link */
                <Link
                  href={href}
                  className="flex items-center gap-2 text-2xl font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  {i === 0 && (
                    <HardDrive size={20} className="shrink-0" />
                  )}
                  {crumb.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
