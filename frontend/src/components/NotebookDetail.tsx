import React, { useState, FormEvent } from "react";
import { Notebook, WordEntry, ExampleSentence, WordSense } from "../types";
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
  onEditSenses: (wordId: string, senses: WordSense[]) => void;
  onUpdateWord?: (wordId: string, updatedWord: WordEntry) => void;
}

const NotebookDetail: React.FC<NotebookDetailProps> = ({
  notebook,
  settings,
  onAddWord,
  onAddCustomExample,
  onDeleteWord,
  onEditSenses,
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
    w.senses.some((sense) =>
      sense.meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sense.context.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sense.note.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 pb-28 md:pb-10">
      {/* Lookup Bar */}
      <div className="mb-8 sticky top-0 z-30 -mx-4 px-4 py-3 md:mx-0 md:px-0 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 border-b border-gray-100">
        <form onSubmit={handleLookup} className="relative max-w-xl mx-auto md:mx-0">
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

      <form
        onSubmit={handleLookup}
        className="md:hidden fixed bottom-4 left-4 right-4 z-40 rounded-2xl border border-gray-200 bg-white/95 backdrop-blur shadow-2xl p-3"
      >
        <div className="relative">
          <input
            type="text"
            placeholder="Tra và thêm từ vựng mới..."
            value={newWord}
            onChange={(e) => {
              setNewWord(e.target.value);
              setError("");
            }}
            className="w-full pl-4 pr-12 py-3 bg-white border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base"
          />
          <button
            type="submit"
            disabled={isLoading || !newWord.trim()}
            className="absolute right-2 top-1.5 bottom-1.5 px-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed flex items-center justify-center transition"
            title="Thêm từ vựng"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
          </button>
        </div>
      </form>

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
              onEditSenses={(senses) => onEditSenses(word.id, senses)}
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
  onEditSenses: (senses: WordSense[]) => void;
  onUpdateExample: (exId: string, updatedExamle: ExampleSentence) => void;
}> = ({ 
  word, 
  notebookWords,
  settings,
  onAddCustomExample,
  onDelete,
  onEditSenses,
  onUpdateExample
}) => {
  const [customEng, setCustomEng] = useState("");
  const [customVie, setCustomVie] = useState("");
  const [isAddingEx, setIsAddingEx] = useState(false);
  const [isEditingSenses, setIsEditingSenses] = useState(false);
  const [editingSensesValue, setEditingSensesValue] = useState("");
  const uniquePartOfSpeechBadges = Array.from(
    new Set(word.senses.map((sense) => sense.partOfSpeech.trim()).filter(Boolean))
  );

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

  const handleStartEditingSenses = () => {
    setEditingSensesValue(
      word.senses.map((sense) => `${sense.partOfSpeech} | ${sense.context} | ${sense.meaning} | ${sense.note}`).join("\n")
    );
    setIsEditingSenses(true);
  };

  const handleSaveSenses = () => {
    const parsedSenses = editingSensesValue
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [partOfSpeech, context, meaning, note] = line.split("|").map((part) => part?.trim() || "");
        return { partOfSpeech, context, meaning, note };
      })
      .filter((sense) => sense.partOfSpeech && sense.context && sense.meaning && sense.note);

    if (parsedSenses.length > 0) {
      onEditSenses(parsedSenses);
    }

    setIsEditingSenses(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm group/card">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 capitalize inline-flex items-center gap-3 flex-wrap">
            {word.word}
            {uniquePartOfSpeechBadges.map((partOfSpeech) => (
              <span key={partOfSpeech} className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wider">
                {partOfSpeech}
              </span>
            ))}
          </h3>
          {isEditingSenses ? (
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveSenses();
              }}
              className="mt-3 space-y-2"
            >
              <textarea
                autoFocus
                value={editingSensesValue}
                onChange={(e) => setEditingSensesValue(e.target.value)}
                className="w-full min-h-[120px] px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-indigo-500"
                placeholder="Mỗi dòng: Loại từ | Ngữ cảnh | Nghĩa | Ghi chú"
              />
              <p className="text-xs text-gray-500">Mỗi dòng theo định dạng: Loại từ | Ngữ cảnh | Nghĩa | Ghi chú</p>
              <div className="flex items-center gap-2">
                <button type="submit" disabled={!editingSensesValue.trim()} className="text-xs px-2.5 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50">Lưu</button>
                <button type="button" onClick={() => setIsEditingSenses(false)} className="text-xs px-2.5 py-1.5 text-gray-600 hover:bg-gray-200 rounded">Hủy</button>
              </div>
            </form>
          ) : (
            <div className="mt-2 group/translation">
              <div className="space-y-2">
                {word.senses.map((sense, index) => (
                  <div key={`${sense.context}-${index}`} className="rounded-lg border border-gray-100 bg-gray-50/70 px-3 py-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wide">{sense.partOfSpeech}</span>
                      <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{sense.context}</span>
                      <span className="text-base text-gray-800 font-medium">{sense.meaning}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{sense.note}</p>
                  </div>
                ))}
              </div>
              <button 
                onClick={handleStartEditingSenses}
                className="mt-2 p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md opacity-0 group-hover/translation:opacity-100 transition-all"
                title="Chỉnh sửa các nghĩa"
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
                <li key={i} className="flex items-center justify-between gap-3 text-sm py-1">
                  <span className="group/related relative min-w-0">
                    <span className="font-medium text-gray-800 cursor-help underline decoration-dotted underline-offset-2">
                      {rw.word}
                    </span>
                    <span className="pointer-events-none absolute left-0 top-full z-20 mt-1 w-max max-w-56 rounded-md bg-gray-900 px-2 py-1 text-xs font-medium text-white shadow-lg opacity-0 transition-opacity duration-150 group-hover/related:opacity-100">
                      {rw.translation}
                    </span>
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded shrink-0">
                    {rw.partOfSpeech}
                  </span>
                </li>
              )) : (
                <li className="text-sm text-gray-500">Không tìm thấy họ từ.</li>
              )}
           </ul>
          </div>

          <div>
             <h4 className="text-sm font-semibold text-gray-900 mb-3 border-b border-gray-100 pb-2">
              Từ đồng nghĩa (Synonyms)
            </h4>
            <ul className="space-y-2">
              {word.synonyms?.length > 0 ? word.synonyms.map((syn, i) => (
                <li key={i} className="flex items-start justify-between gap-3 text-sm py-1">
                  <span className="group/synonym relative min-w-0">
                    <span className="font-medium text-indigo-700 cursor-help underline decoration-dotted underline-offset-2">
                      {syn.word}
                    </span>
                    <span className="pointer-events-none absolute left-0 top-full z-20 mt-1 w-max max-w-64 rounded-md bg-gray-900 px-2 py-1 text-xs font-medium text-white shadow-lg opacity-0 transition-opacity duration-150 group-hover/synonym:opacity-100 whitespace-normal">
                      {syn.translation}{syn.note ? ` — ${syn.note}` : ""}
                    </span>
                  </span>
                </li>
              )) : (
                <li className="text-sm text-gray-500">Không tìm thấy từ đồng nghĩa phù hợp.</li>
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
