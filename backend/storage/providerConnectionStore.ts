import fs from "node:fs/promises";
import path from "node:path";

export type SavedProviderName = "gemini" | "litellm" | "openai" | "grok";

export interface SavedProviderConnection {
  id: string;
  name: string;
  provider: SavedProviderName;
  model: string;
  apiUrl: string;
  apiKey: string;
}

export interface ProviderConnectionState {
  activeConnectionId: string;
  connections: SavedProviderConnection[];
}

const storagePath = path.join(process.cwd(), "backend/storage/provider-connections.json");

const defaultState: ProviderConnectionState = {
  activeConnectionId: "",
  connections: [],
};

export async function readProviderConnections(): Promise<ProviderConnectionState> {
  try {
    const raw = await fs.readFile(storagePath, "utf8");
    const parsed = JSON.parse(raw) as ProviderConnectionState;
    return normalizeState(parsed);
  } catch {
    await writeProviderConnections(defaultState);
    return defaultState;
  }
}

export async function writeProviderConnections(state: ProviderConnectionState): Promise<ProviderConnectionState> {
  const normalized = normalizeState(state);
  await fs.mkdir(path.dirname(storagePath), { recursive: true });
  await fs.writeFile(storagePath, JSON.stringify(normalized, null, 2), "utf8");
  return normalized;
}

function normalizeState(state: ProviderConnectionState): ProviderConnectionState {
  const connections = Array.isArray(state.connections) ? state.connections : defaultState.connections;
  const activeConnectionId = connections.some((connection) => connection.id === state.activeConnectionId)
    ? state.activeConnectionId
    : connections[0]?.id || "";

  return {
    activeConnectionId,
    connections,
  };
}
