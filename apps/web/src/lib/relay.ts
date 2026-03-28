import { RelayClient } from "@mesh/contracts/client";

export const DEFAULT_ROOM = "mesh01";
export const DEFAULT_RELAY_URL =
  process.env.NEXT_PUBLIC_RELAY_URL ?? process.env.RELAY_URL ?? "http://localhost:3000";

export function getRelayBaseUrl() {
  return DEFAULT_RELAY_URL.replace(/\/$/, "");
}

export const relayClient = new RelayClient({ baseUrl: getRelayBaseUrl() });

export type SearchValue = string | string[] | undefined;

export function pickSearchValue(value: SearchValue, fallback = DEFAULT_ROOM) {
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value ?? fallback;
}

export async function fetchRelayJson<T>(path: string): Promise<T> {
  const response = await fetch(`${getRelayBaseUrl()}${path}`, {
    next: { revalidate: 15 },
  });

  if (!response.ok) {
    throw new Error(`Relay request failed: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
}
