const AUTH_BROADCAST_CHANNEL = "dgp-auth";

type AuthBroadcastMessage = {
  type: "logout";
};

export function publishAuthLogout(): void {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
    return;
  }

  const channel = new BroadcastChannel(AUTH_BROADCAST_CHANNEL);
  channel.postMessage({ type: "logout" } satisfies AuthBroadcastMessage);
  channel.close();
}

export function subscribeAuthLogout(onLogout: () => void): () => void {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
    return () => undefined;
  }

  const channel = new BroadcastChannel(AUTH_BROADCAST_CHANNEL);
  const handler = (event: MessageEvent<AuthBroadcastMessage>) => {
    if (event.data?.type === "logout") {
      onLogout();
    }
  };

  channel.addEventListener("message", handler);

  return () => {
    channel.removeEventListener("message", handler);
    channel.close();
  };
}

export function createSessionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `session-${Date.now()}`;
}
