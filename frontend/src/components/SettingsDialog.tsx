import React from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { useSettings, AppSettings } from '../useSettings';

async function parseJsonResponse(response: Response) {
  const text = await response.text();
  if (!text.trim()) {
    return null;
  }

  return JSON.parse(text);
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsDialog: React.FC<Props> = ({ isOpen, onClose }) => {
  const { settings, isLoaded, connections, activeConnectionId, updateSettings, setActiveConnection, createConnection, renameConnection, deleteConnection } = useSettings();
  const hasConnections = connections.length > 0;
  const [availableModels, setAvailableModels] = React.useState<string[]>([]);
  const [isDiscoveringModels, setIsDiscoveringModels] = React.useState(false);
  const [modelDiscoveryError, setModelDiscoveryError] = React.useState('');

  const canDiscoverModels = hasConnections && (settings.provider === 'gemini' || !!settings.apiUrl.trim()) && (settings.provider === 'gemini' || !!settings.apiKey.trim());

  React.useEffect(() => {
    if (!hasConnections) {
      setAvailableModels([]);
      setModelDiscoveryError('');
      setIsDiscoveringModels(false);
    }
  }, [hasConnections]);

  React.useEffect(() => {
    if (!hasConnections) return;
    setAvailableModels((prev) => (settings.model && !prev.includes(settings.model) ? [settings.model, ...prev] : prev));
  }, [hasConnections, settings.model]);

  const discoverModels = React.useCallback(async () => {
    if (!canDiscoverModels) return;

    setIsDiscoveringModels(true);
    setModelDiscoveryError('');

    try {
      const response = await fetch('/api/provider-connections/discover-models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: settings.provider,
          apiUrl: settings.apiUrl,
          apiKey: settings.apiKey,
        }),
      });

      const data = await parseJsonResponse(response);
      if (!response.ok) {
        throw new Error(data?.error || 'Không thể tải danh sách mô hình');
      }

      const models = Array.isArray(data.models) ? data.models : [];
      setAvailableModels(models);
      if (models.length > 0 && !models.includes(settings.model)) {
        updateSettings({ model: models[0] });
      }
    } catch (error: any) {
      setAvailableModels([]);
      setModelDiscoveryError(error?.message || 'Không thể tải danh sách mô hình');
    } finally {
      setIsDiscoveringModels(false);
    }
  }, [canDiscoverModels, settings.provider, settings.apiUrl, settings.apiKey, settings.model, updateSettings]);

  if (!isOpen) return null;
  if (!isLoaded) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Cài đặt mô hình AI</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Chọn cấu hình
              </label>
              <button
                type="button"
                onClick={createConnection}
                className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                <Plus className="h-3.5 w-3.5" />
                Tạo cấu hình mới
              </button>
            </div>

            {hasConnections ? (
              <>
                <select
                  value={activeConnectionId}
                  onChange={(e) => setActiveConnection(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500"
                >
                  {connections.map((connection) => (
                    <option key={connection.id} value={connection.id}>
                      {connection.name}
                    </option>
                  ))}
                </select>

                <div className="flex items-end gap-2">
                  <div className="w-full space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Tên cấu hình
                    </label>
                    <input
                      type="text"
                      value={connections.find((connection) => connection.id === activeConnectionId)?.name || ''}
                      onChange={(e) => renameConnection(e.target.value)}
                      placeholder="Nhập tên cấu hình"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteConnection(activeConnectionId)}
                    className="inline-flex h-10 items-center justify-center self-end rounded-md border border-red-200 px-3 text-red-600 hover:bg-red-50"
                    title="Xóa cấu hình"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="rounded-md border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                Chưa có cấu hình nào. Hãy bấm <span className="font-medium">Tạo cấu hình mới</span> để bắt đầu.
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nhà cung cấp
            </label>
            <select
              value={settings.provider}
              onChange={(e) => updateSettings({ provider: e.target.value as AppSettings['provider'] })}
              disabled={!hasConnections}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-400"
            >
              <option value="gemini">Gemini</option>
              <option value="openai">OpenAI</option>
              <option value="grok">Grok / xAI</option>
              <option value="litellm">LiteLLM / OpenAI Compatible</option>
            </select>
          </div>

          <div className="space-y-4 border-t border-gray-100 pt-4">
            {hasConnections && settings.provider !== 'gemini' && (
            <div className="space-y-4 border-t border-gray-100 pt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base URL
                </label>
                <input
                  type="text"
                  value={settings.apiUrl}
                  onChange={(e) => updateSettings({ apiUrl: e.target.value })}
                  placeholder="e.g. http://localhost:4000 or https://api.openai.com/v1"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Key
                </label>
                <input
                  type="password"
                  value={settings.apiKey}
                  onChange={(e) => updateSettings({ apiKey: e.target.value })}
                  placeholder="Có thể để trống nếu muốn dùng key từ backend env"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            )}

            <div className="space-y-3 border-t border-gray-100 pt-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô hình khả dụng
                  </label>
                  <p className="text-xs text-gray-500">
                    Chọn provider và cấu hình kết nối trước, sau đó tải danh sách model.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void discoverModels()}
                  disabled={!canDiscoverModels || isDiscoveringModels}
                  className="inline-flex items-center rounded-md border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                >
                  {isDiscoveringModels ? 'Đang tải...' : 'Tải danh sách model'}
                </button>
              </div>

              <select
                value={settings.model}
                onChange={(e) => updateSettings({ model: e.target.value })}
                disabled={!hasConnections || availableModels.length === 0}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-400"
              >
                {availableModels.length === 0 ? (
                  <option value="">Chưa có model nào. Hãy tải danh sách model trước.</option>
                ) : (
                  availableModels.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))
                )}
              </select>

              {modelDiscoveryError && (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {modelDiscoveryError}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
