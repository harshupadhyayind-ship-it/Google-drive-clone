export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { registerSSEClient, unregisterSSEClient } from "@/lib/sse";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const userId = session.user.id;

  const stream = new ReadableStream({
    start(controller) {
      registerSSEClient(userId, controller);

      // Send a ping so the client knows the connection is live
      try {
        controller.enqueue(
          new TextEncoder().encode("event: ping\ndata: connected\n\n")
        );
      } catch {}

      // Clean up when the client disconnects
      req.signal.addEventListener("abort", () => {
        unregisterSSEClient(userId);
      });
    },
    cancel() {
      unregisterSSEClient(userId);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type":  "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection":    "keep-alive",
      "X-Accel-Buffering": "no", // disable nginx buffering
    },
  });
}
