import React, { useState, useEffect } from 'react';
import { ExampleSentence, GrammarChunk, WordEntry } from '../types';
import { Loader2, Wand2 } from 'lucide-react';
import { AppSettings } from '../useSettings';

async function parseJsonResponse(response: Response) {
  const text = await response.text();
  if (!text.trim()) {
    return null;
  }

  return JSON.parse(text);
}

interface Props {
  sentence: ExampleSentence;
  notebookWords: WordEntry[];
  settings: AppSettings;
  onUpdateSentence: (updated: ExampleSentence) => void;
}

const colorMap: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-800 border-blue-200',
  green: 'bg-green-100 text-green-800 border-green-200',
  purple: 'bg-purple-100 text-purple-800 border-purple-200',
  pink: 'bg-pink-100 text-pink-800 border-pink-200',
  amber: 'bg-amber-100 text-amber-800 border-amber-200',
  indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  rose: 'bg-rose-100 text-rose-800 border-rose-200',
  teal: 'bg-teal-100 text-teal-800 border-teal-200',
};

const defaultColor = 'bg-gray-100 text-gray-800 border-gray-200';

export const AnalyzedSentence: React.FC<Props> = ({ sentence, notebookWords, settings, onUpdateSentence }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = async () => {
    if (!sentence.vietnamese) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const res = await fetch('/api/analyzeSentence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          english: sentence.english, 
          vietnamese: sentence.vietnamese,
          provider: settings.provider,
          model: settings.model,
          apiUrl: settings.apiUrl,
          apiKey: settings.apiKey
        })
      });

      const data = await parseJsonResponse(res);
      if (!res.ok) {
        throw new Error((data as any)?.error || 'Analysis failed');
      }

      if (data.chunks) {
        onUpdateSentence({ ...sentence, chunks: data.chunks });
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi phân tích cú pháp');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!sentence.chunks) {
    return (
      <div className="group relative">
        <div className="text-gray-900 font-medium mb-1 pr-10">{sentence.english}</div>
        <div className="text-gray-600">{sentence.vietnamese}</div>
        
        {sentence.vietnamese && (
          <button 
            onClick={analyze}
            disabled={isAnalyzing}
            className="absolute top-0 right-0 p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-100"
            title="Phân tích cú pháp (AI)"
          >
            {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin text-indigo-500" /> : <Wand2 className="w-4 h-4" />}
          </button>
        )}
        {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* English Chunks */}
      <div className="flex flex-wrap gap-1.5 items-end">
        {sentence.chunks.map((chunk, i) => {
          const colorClass = colorMap[chunk.color] || defaultColor;
          return (
            <div key={`en-${i}`} className="group/chunk relative flex flex-col items-center">
              <span className={`text-[10px] font-medium uppercase tracking-wider mb-0.5 opacity-0 group-hover/chunk:opacity-100 transition-opacity absolute bottom-full whitespace-nowrap px-1.5 py-0.5 rounded bg-gray-800 text-white z-10 font-sans pointer-events-none`}>
                {chunk.type}
              </span>
              <span className={`px-1.5 py-0.5 rounded border text-[15px] font-medium leading-relaxed cursor-help ${colorClass}`}>
                {chunk.english}
              </span>
            </div>
          );
        })}
      </div>

      {/* Vietnamese Chunks */}
      <div className="flex flex-wrap gap-1.5">
        {sentence.chunks.map((chunk, i) => {
          const colorClass = colorMap[chunk.color] || defaultColor;
          return (
            <span key={`vn-${i}`} className={`px-1.5 py-0.5 rounded border text-[14px] leading-relaxed cursor-help ${colorClass}`}>
              {chunk.vietnamese}
            </span>
          );
        })}
      </div>
    </div>
  );
};
