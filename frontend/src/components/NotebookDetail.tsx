import React, { useState, FormEvent } from "react";
import { Notebook, WordEntry, ExampleSentence } from "../types";
import { Plus, Search, Sparkles, Loader2, Trash2, ArrowRight, Pencil } from "lucide-react";
import { InteractiveSentence } from "./InteractiveSentence";
import { AnalyzedSentence } from "./AnalyzedSentence";
import { AppSettings } from "../useSettings";

async function parseJsonResponse(response: Response) {
  const text = await response.text();
  if (!text.trim()) {
    return null;
  }

  return JSON.parse(text);
}

interface NotebookDetailProps {
  notebook: Notebook;
  settings: AppSettings;
  onAddWord: (word: WordEntry) => void;
  onAddCustomExample: (wordId: string, example: ExampleSentence) => void;
  onDeleteWord: (wordId: string) => void;
  onEditTranslation: (wordId: string, newTranslation: string) => void;
  onUpdateWord?: (wordId: string, updatedWord: WordEntry) => void;
}

const NotebookDetail: React.FC<NotebookDetailProps> = ({
  notebook,
  settings,
  onAddWord,
  onAddCustomExample,
  onDeleteWord,
  onEditTranslation,
  onUpdateWord
}) => {
  const [newWord, setNewWord] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const handleLookup = async (e: FormEvent) => {
    e.preventDefault();
    if (!newWord.trim()) return;

    // Check if word already exists
    if (notebook.words.some(w => w.word.toLowerCase() === newWord.trim().toLowerCase())) {
      setError("Từ này đã có trong sổ tay.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/lookupWord", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          word: newWord.trim(),
          provider: settings.provider,
          model: settings.model,
          apiUrl: settings.apiUrl,
          apiKey: settings.apiKey
        }),
      });

      const data = await parseJsonResponse(response);

      if (!response.ok) {
        throw new Error((data as any)?.error || "Failed to fetch word details");
      }
      
      const newEntry: WordEntry = {
        ...data,
        id: Date.now().toString(),
        createdAt: Date.now(),
        examples: data.examples.map((ex: any) => ({
          id: Math.random().toString(36).substring(2, 9),
          ...ex,
          isCustom: false
        }))
      };

      onAddWord(newEntry);
      setNewWord("");
    } catch (err) {
      setError("Có lỗi xảy ra khi tra từ. Hãy thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredWords = notebook.words.filter(w => 
    w.word.toLowerCase().includes(searchQuery.toLowerCase()) || 
    w.translation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      {/* Lookup Bar */}
      <div className="mb-8">
        <form onSubmit={handleLookup} className="relative max-w-xl">
          <input
            type="text"
            placeholder="Tra và thêm từ vựng mới..."
            value={newWord}
            onChange={(e) => {
              setNewWord(e.target.value);
              setError("");
            }}
            className="w-full pl-4 pr-12 py-3 bg-white border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
          />
          <button 
            type="submit"
            disabled={isLoading || !newWord.trim()}
            className="absolute right-2 top-1.5 bottom-1.5 px-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed flex items-center justify-center transition"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
          </button>
        </form>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      {/* Word List Tools */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Danh sách từ vựng ({notebook.words.length})
        </h2>
        {notebook.words.length > 0 && (
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-indigo-500"
            />
          </div>
        )}
      </div>

      {/* Words Grid */}
      {notebook.words.length === 0 ? (
        <div className="text-center py-12 text-gray-500 border border-dashed border-gray-300 rounded-xl">
          Chưa có từ vựng nào trong sổ tay này. Thêm một từ ở trên để bắt đầu!
        </div>
      ) : filteredWords.length === 0 ? (
         <div className="text-center py-12 text-gray-500">
          Không tìm thấy từ vựng phù hợp.
        </div>
      ) : (
        <div className="space-y-6">
          {filteredWords.map(word => (
            <WordCard 
              key={word.id} 
              word={word} 
              notebookWords={notebook.words}
              settings={settings}
              onAddCustomExample={(example) => onAddCustomExample(word.id, example)}
              onDelete={() => onDeleteWord(word.id)}
              onEditTranslation={(newTranslation) => onEditTranslation(word.id, newTranslation)}
              onUpdateExample={(exId, updatedExample) => {
                if (onUpdateWord) {
                   onUpdateWord(word.id, {
                     ...word,
                     examples: word.examples.map(ex => ex.id === exId ? updatedExample : ex)
                   });
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default NotebookDetail;

// ------ Word Card Component ------

const WordCard: React.FC<{ 
  word: WordEntry; 
  notebookWords: WordEntry[];
  settings: AppSettings;
  onAddCustomExample: (ex: ExampleSentence) => void;
  onDelete: () => void;
  onEditTranslation: (newTranslation: string) => void;
  onUpdateExample: (exId: string, updatedExamle: ExampleSentence) => void;
}> = ({ 
  word, 
  notebookWords,
  settings,
  onAddCustomExample,
  onDelete,
  onEditTranslation,
  onUpdateExample
}) => {
  const [customEng, setCustomEng] = useState("");
  const [customVie, setCustomVie] = useState("");
  const [isAddingEx, setIsAddingEx] = useState(false);
  const [isEditingTranslation, setIsEditingTranslation] = useState(false);
  const [editingTranslationValue, setEditingTranslationValue] = useState("");

  const handleAddExample = (e: FormEvent) => {
    e.preventDefault();
    if (!customEng.trim()) return;
    
    onAddCustomExample({
      id: Date.now().toString(),
      english: customEng.trim(),
      vietnamese: customVie.trim() || undefined,
      isCustom: true
    });
    setCustomEng("");
    setCustomVie("");
    setIsAddingEx(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm group/card">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 capitalize inline-flex items-end gap-3">
            {word.word}
            <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wider mb-1">
              {word.partOfSpeech}
            </span>
          </h3>
          {isEditingTranslation ? (
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (editingTranslationValue.trim()) {
                  onEditTranslation(editingTranslationValue.trim());
                }
                setIsEditingTranslation(false);
              }}
              className="mt-2 flex items-center gap-2"
            >
              <input
                type="text"
                autoFocus
                value={editingTranslationValue}
                onChange={(e) => setEditingTranslationValue(e.target.value)}
                className="flex-1 min-w-[250px] px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-indigo-500"
              />
              <button type="submit" disabled={!editingTranslationValue.trim()} className="text-xs px-2.5 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50">Lưu</button>
              <button type="button" onClick={() => setIsEditingTranslation(false)} className="text-xs px-2.5 py-1.5 text-gray-600 hover:bg-gray-200 rounded">Hủy</button>
            </form>
          ) : (
            <div className="flex items-center gap-2 mt-1 group/translation">
              <p className="text-lg text-gray-700">{word.translation}</p>
              <button 
                onClick={() => {
                  setEditingTranslationValue(word.translation);
                  setIsEditingTranslation(true);
                }}
                className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md opacity-0 group-hover/translation:opacity-100 transition-all"
                title="Chỉnh sửa nghĩa"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
        <button 
          onClick={onDelete}
          className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-md transition"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Examples Section */}
        <div className="md:col-span-2 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                Ví dụ (Examples)
              </h4>
              <button 
                onClick={() => setIsAddingEx(!isAddingEx)}
                className="text-xs text-indigo-600 font-medium hover:underline"
              >
                + Thêm ví dụ
              </button>
            </div>
            
            <div className="space-y-3">
              {word.examples.map((ex, idx) => (
                <div key={ex.id} className="bg-gray-50/80 rounded-xl border border-gray-100 p-4 transition-all">
                  {ex.topic && !ex.isCustom && (
                    <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider block mb-2">
                      Topic: {ex.topic}
                    </span>
                  )}
                  {ex.isCustom && (
                    <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block mb-2">
                      Ghi chú của bạn
                    </span>
                  )}
                  <AnalyzedSentence 
                    sentence={ex} 
                    notebookWords={notebookWords}
                    settings={settings}
                    onUpdateSentence={(updated) => onUpdateExample(ex.id, updated)}
                  />
                </div>
              ))}
            </div>

            {isAddingEx && (
              <form onSubmit={handleAddExample} className="mt-3 bg-indigo-50/50 border border-indigo-100 rounded-lg p-3">
                <input
                  type="text"
                  placeholder="Ví dụ tiếng Anh..."
                  value={customEng}
                  onChange={(e) => setCustomEng(e.target.value)}
                  className="w-full text-sm px-3 py-2 bg-white border border-gray-300 rounded mb-2 focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="text"
                  placeholder="Nghĩa tiếng Việt (tùy chọn)..."
                  value={customVie}
                  onChange={(e) => setCustomVie(e.target.value)}
                  className="w-full text-sm px-3 py-2 bg-white border border-gray-300 rounded mb-2 focus:outline-none focus:border-indigo-500"
                />
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setIsAddingEx(false)} className="text-xs px-3 py-1.5 text-gray-600 hover:bg-gray-200 rounded">Hủy</button>
                  <button type="submit" disabled={!customEng.trim()} className="text-xs px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50">Lưu ví dụ</button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Sidebar Section */}
        <div className="space-y-6">
          {/* Word Family Section */}
          <div>
             <h4 className="text-sm font-semibold text-gray-900 mb-3 border-b border-gray-100 pb-2">
              Họ từ (Word Family)
            </h4>
            <ul className="space-y-2">
              {word.relatedWords?.length > 0 ? word.relatedWords.map((rw, i) => (
                <li key={i} className="flex items-center justify-between text-sm py-1">
                  <span className="font-medium text-gray-800">{rw.word}</span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    {rw.partOfSpeech}
                  </span>
                </li>
              )) : (
                <li className="text-sm text-gray-500">Không tìm thấy họ từ.</li>
              )}
            </ul>
          </div>

          {/* Collocations / Prepositions / Phrases */}
          <div>
             <h4 className="text-sm font-semibold text-gray-900 mb-3 border-b border-gray-100 pb-2">
              Cụm từ / Giới từ (Collocations)
            </h4>
            <ul className="space-y-3">
              {word.collocations?.length > 0 ? word.collocations.map((col, i) => (
                <li key={i} className="text-sm">
                  <span className="font-medium text-indigo-700 block mb-0.5">{col.phrase}</span>
                  <span className="text-gray-600 block text-xs">{col.translation}</span>
                </li>
              )) : (
                <li className="text-sm text-gray-500">Không tìm thấy cụm từ liên quan.</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
