import { useState, FormEvent, useEffect } from "react";
import { Book, Plus, GraduationCap, ChevronRight, Menu, X, Command, Pencil, PanelLeftClose, PanelLeftOpen, Settings } from "lucide-react";

import { useNotebooks } from "./useNotebooks";
import { useSettings } from "./useSettings";
import NotebookDetail from "./components/NotebookDetail";
import { SettingsDialog } from "./components/SettingsDialog";

export default function App() {
  const {
    notebooks,
    isLoaded,
    addNotebook,
    addWordToNotebook,
    addCustomExample,
    deleteWord,
    deleteNotebook,
    renameNotebook,
    editWordSenses,
    updateWord
  } = useNotebooks();
  
  const { settings } = useSettings();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [activeNotebookId, setActiveNotebookId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(288);
  const [isResizing, setIsResizing] = useState(false);
  
  const [newNotebookName, setNewNotebookName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  
  const [editingNotebookId, setEditingNotebookId] = useState<string | null>(null);
  const [editNotebookName, setEditNotebookName] = useState("");

  useEffect(() => {
    if (!isResizing) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      // Limit sidebar width between 200px and 600px
      const newWidth = Math.max(200, Math.min(e.clientX, 600));
      setSidebarWidth(newWidth);
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    // Disable text selection during resize
    document.body.style.userSelect = 'none';
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  if (!isLoaded) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;

  const handleCreateNotebook = (e: FormEvent) => {
    e.preventDefault();
    if (!newNotebookName.trim()) return;
    const id = addNotebook(newNotebookName.trim());
    setNewNotebookName("");
    setIsCreating(false);
    setActiveNotebookId(id);
    setIsSidebarOpen(false);
  };

  const activeNotebook = notebooks.find((nb) => nb.id === activeNotebookId);

  return (
    <div className="flex h-screen bg-white text-gray-900 font-sans">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-20 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`
          fixed inset-y-0 left-0 bg-[#f8f9fa] border-r border-gray-200 z-30 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 shrink-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          ${!isDesktopSidebarOpen ? 'md:hidden' : ''}
          flex flex-col
        `}
        style={{ width: isSidebarOpen || isDesktopSidebarOpen ? sidebarWidth : undefined }}
      >
        {/* Resizer Handle */}
        <div 
          className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-indigo-300 z-40 md:block hidden opacity-50 hover:opacity-100 transition-opacity"
          onMouseDown={(e) => {
            e.preventDefault();
            setIsResizing(true);
          }}
        />
        <div className="p-4 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-lg">
            <GraduationCap className="w-6 h-6" />
            <span>LingoMinds</span>
          </div>
          <button className="md:hidden text-gray-400 hover:text-gray-600" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <div className="mb-2 flex items-center justify-between text-xs font-medium text-gray-500 uppercase tracking-wider px-2">
            <span>Sổ tay của bạn</span>
            <button 
              onClick={() => setIsCreating(true)}
              className="p-1 hover:bg-gray-200 rounded text-gray-600"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {isCreating && (
            <form onSubmit={handleCreateNotebook} className="mb-2 p-2">
              <input
                type="text"
                autoFocus
                placeholder="Tên sổ tay..."
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                value={newNotebookName}
                onChange={(e) => setNewNotebookName(e.target.value)}
                onBlur={() => !newNotebookName.trim() && setIsCreating(false)}
              />
            </form>
          )}

          <ul className="space-y-1">
            {notebooks.length === 0 && !isCreating && (
              <li className="text-sm text-gray-500 px-2 py-3 text-center">
                Chưa có sổ tay nào.
              </li>
            )}
            {notebooks.map((nb) => (
              <li key={nb.id}>
                {editingNotebookId === nb.id ? (
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (editNotebookName.trim()) {
                        renameNotebook(nb.id, editNotebookName.trim());
                      }
                      setEditingNotebookId(null);
                    }}
                    className="px-2 py-1 w-full"
                  >
                    <input
                      type="text"
                      autoFocus
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-indigo-500"
                      value={editNotebookName}
                      onChange={(e) => setEditNotebookName(e.target.value)}
                      onBlur={() => {
                        if (editNotebookName.trim()) {
                          renameNotebook(nb.id, editNotebookName.trim());
                        }
                        setEditingNotebookId(null);
                      }}
                    />
                  </form>
                ) : (
                  <div className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors group ${
                    activeNotebookId === nb.id
                      ? 'bg-indigo-50 text-indigo-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-200/50'
                  }`}>
                    <button
                      onClick={() => {
                        setActiveNotebookId(nb.id);
                        setIsSidebarOpen(false);
                      }}
                      className="flex items-center gap-2 flex-1 min-w-0"
                    >
                      <Book className={`w-4 h-4 shrink-0 ${activeNotebookId === nb.id ? 'text-indigo-600' : 'text-gray-400'}`} />
                      <span className="truncate">{nb.name}</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingNotebookId(nb.id);
                        setEditNotebookName(nb.name);
                      }}
                      className="p-1 shrink-0 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-indigo-600 transition-opacity"
                      title="Đổi tên sổ tay"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen min-w-0 bg-white">
        {/* Header */}
        <header className="h-14 border-b border-gray-200 flex items-center px-4 shrink-0 bg-white md:bg-transparent min-w-0">
          <button 
            className="md:hidden p-2 -ml-2 mr-2 text-gray-600 hover:bg-gray-100 rounded-md"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          <button 
            className="hidden md:block p-1.5 -ml-2 mr-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            onClick={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)}
            title={isDesktopSidebarOpen ? "Đóng sổ tay" : "Mở sổ tay"}
          >
            {isDesktopSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
          </button>

          {activeNotebook ? (
            <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
              <Book className="w-4 h-4 text-gray-400 hidden md:block" />
              <span>{activeNotebook.name}</span>
            </div>
          ) : (
            <div className="text-sm text-gray-500">Chưa chọn sổ tay</div>
          )}

          <div className="ml-auto">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              title="Cài đặt mô hình AI"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">
          {activeNotebook ? (
            <NotebookDetail
              key={activeNotebook.id}
              notebook={activeNotebook}
              settings={settings}
              onAddWord={(word) => addWordToNotebook(activeNotebook.id, word)}
              onAddCustomExample={(wordId, example) => addCustomExample(activeNotebook.id, wordId, example)}
              onDeleteWord={(wordId) => deleteWord(activeNotebook.id, wordId)}
              onEditSenses={(wordId, senses) => editWordSenses(activeNotebook.id, wordId, senses)}
              onUpdateWord={(wordId, updated) => updateWord(activeNotebook.id, updated)}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 bg-gray-50 border border-gray-200 shadow-sm rounded-2xl flex items-center justify-center mb-4">
                <Command className="w-8 h-8 text-gray-300" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Học từ vựng thông minh</h2>
              <p className="text-gray-500 max-w-sm mb-6 text-sm">
                Tạo một sổ tay để bắt đầu lưu trữ từ vựng. Hệ thống AI sẽ tự động phân loại, đưa ra ví dụ và họ từ liên quan.
              </p>
              <button
                onClick={() => setIsCreating(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-indigo-700 transition"
              >
                Tạo sổ tay đầu tiên
              </button>
            </div>
          )}
        </main>
      </div>
      <SettingsDialog isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}
