import { useEffect, useState } from "react";

export interface AppSettings {
  provider: 'gemini' | 'litellm' | 'openai' | 'grok';
  model: string;
  apiUrl: string;
  apiKey: string;
}

export interface SavedConnection extends AppSettings {
  id: string;
  name: string;
}

interface ConnectionState {
  activeConnectionId: string;
  connections: SavedConnection[];
}

const defaultSettings: AppSettings = {
  provider: 'gemini',
  model: 'gemini-2.5-flash',
  apiUrl: '',
  apiKey: ''
};

const defaultConnectionState: ConnectionState = {
  activeConnectionId: '',
  connections: [],
};

export const useSettings = () => {
  const [connectionState, setConnectionState] = useState<ConnectionState>(defaultConnectionState);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/provider-connections');
        if (!response.ok) throw new Error('Failed to load provider connections');
        const saved = await response.json();
        setConnectionState(normalizeConnectionState(saved));
      } catch {
        setConnectionState(defaultConnectionState);
      } finally {
        setIsLoaded(true);
      }
    };

    void loadSettings();
  }, []);

  const activeConnection = connectionState.connections.find((connection) => connection.id === connectionState.activeConnectionId) || connectionState.connections[0];
  const settings: AppSettings = activeConnection || defaultSettings;

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setConnectionState((prev) => {
      if (!prev.activeConnectionId) return prev;
      const updatedConnections = prev.connections.map((connection) =>
        connection.id === prev.activeConnectionId ? { ...connection, ...newSettings } : connection,
      );
      const updatedState = { ...prev, connections: updatedConnections };
      const normalizedState = normalizeConnectionState(updatedState);
      void persistConnections(normalizedState);
      return normalizedState;
    });
  };

  const setActiveConnection = (connectionId: string) => {
    setConnectionState((prev) => {
      const updatedState = { ...prev, activeConnectionId: connectionId };
      const normalizedState = normalizeConnectionState(updatedState);
      void persistConnections(normalizedState);
      return normalizedState;
    });
  };

  const createConnection = () => {
    const newConnection: SavedConnection = {
      id: `connection-${Date.now()}`,
      name: 'Cấu hình mới',
      ...defaultSettings,
    };

    setConnectionState((prev) => {
      const updatedState = {
        activeConnectionId: newConnection.id,
        connections: [...prev.connections, newConnection],
      };
      const normalizedState = normalizeConnectionState(updatedState);
      void persistConnections(normalizedState);
      return normalizedState;
    });
  };

  const renameConnection = (name: string) => {
    setConnectionState((prev) => {
      if (!prev.activeConnectionId) return prev;
      const updatedConnections = prev.connections.map((connection) =>
        connection.id === prev.activeConnectionId ? { ...connection, name } : connection,
      );
      const updatedState = { ...prev, connections: updatedConnections };
      const normalizedState = normalizeConnectionState(updatedState);
      void persistConnections(normalizedState);
      return normalizedState;
    });
  };

  const deleteConnection = (connectionId: string) => {
    setConnectionState((prev) => {
      const remainingConnections = prev.connections.filter((connection) => connection.id !== connectionId);
      const updatedState = {
        activeConnectionId: remainingConnections[0]?.id || '',
        connections: remainingConnections,
      };
      const normalizedState = normalizeConnectionState(updatedState);
      void persistConnections(normalizedState);
      return normalizedState;
    });
  };

  return { settings, isLoaded, connections: connectionState.connections, activeConnectionId: connectionState.activeConnectionId, updateSettings, setActiveConnection, createConnection, renameConnection, deleteConnection };
};

async function persistConnections(state: ConnectionState) {
  await fetch('/api/provider-connections', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(state),
  });
}

function normalizeConnectionState(state: ConnectionState): ConnectionState {
  const connections = Array.isArray(state.connections) ? state.connections : [];
  const activeConnectionId = connections.some((connection) => connection.id === state.activeConnectionId)
    ? state.activeConnectionId
    : connections[0]?.id || '';

  return {
    activeConnectionId,
    connections,
  };
}
