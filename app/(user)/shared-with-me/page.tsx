import type { Metadata } from "next";

export const metadata: Metadata = { title: "Shared with me" };

// app/(user)/shared-with-me/page.tsx

import { SharedWithMeContent } from "@/lib/ui/drive/SharedWithMeContent";

export default function SharedWithMePage() {
  return <SharedWithMeContent />;
}
