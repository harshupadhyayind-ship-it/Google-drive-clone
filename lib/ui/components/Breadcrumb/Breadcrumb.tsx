import Link from "next/link";

export type BreadcrumbItem = {
  label: string;
  href?: string;
  isCurrent?: boolean;
};

export function Breadcrumb({
  items,
  separator = "/",
}: {
  items: BreadcrumbItem[];
  separator?: string;
}) {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          const current = item.isCurrent ?? isLast;

          return (
            <li key={`${item.label}-${idx}`} className="flex items-center gap-2">
              {item.href && !current ? (
                <Link
                  href={item.href}
                  className="hover:text-foreground hover:underline"
                >
                  {item.label}
                </Link>
              ) : (
                <span aria-current={current ? "page" : undefined} className="text-foreground font-medium">
                  {item.label}
                </span>
              )}

              {!isLast && <span aria-hidden="true">{separator}</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

