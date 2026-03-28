import type { Metadata } from "next";

export const metadata: Metadata = { title: "Search" };

// app/(user)/search/page.tsx

import { SearchContent } from "@/lib/ui/drive/SearchContent";

export default function SearchPage() {
  return <SearchContent />;
}
