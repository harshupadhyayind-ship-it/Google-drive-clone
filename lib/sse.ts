/**
 * In-process SSE client registry.
 * Stored on `globalThis` so it survives Next.js hot-reloads in development.
 * In production serverless each instance is isolated — acceptable for this use-case;
 * upgrade to Redis Pub/Sub for multi-instance deployments.
 */

declare global {
  // eslint-disable-next-line no-var
  var __sseClients: Map<string, ReadableStreamDefaultController> | undefined;
}

const clients: Map<string, ReadableStreamDefaultController> =
  globalThis.__sseClients ??
  (globalThis.__sseClients = new Map());

export function registerSSEClient(
  userId: string,
  controller: ReadableStreamDefaultController
) {
  clients.set(userId, controller);
}

export function unregisterSSEClient(userId: string) {
  clients.delete(userId);
}

/** Push a named SSE event to a specific user. Returns true if delivered. */
export function pushToUser(userId: string, event: string, data: unknown): boolean {
  const controller = clients.get(userId);
  if (!controller) return false;
  try {
    const chunk = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    controller.enqueue(new TextEncoder().encode(chunk));
    return true;
  } catch {
    // Stream was closed — clean up
    clients.delete(userId);
    return false;
  }
}
