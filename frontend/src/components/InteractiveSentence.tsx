import React, { useState, useEffect, useRef } from "react";
import { WordEntry, ExampleSentence } from "../types";
import { Loader2 } from "lucide-react";

const getMeaningTargets = (wordEntry: WordEntry) =>
  wordEntry.senses.flatMap((sense) =>
    sense.meaning
      .split(/[,;]/)
      .map((part) => part.trim().toLowerCase())
      .filter((part) => part.length > 0)
  );

// Cache for dynamically fetched words
const fetchPromiseCache = new Map<string, Promise<WordEntry | null>>();

interface InteractiveSentenceProps {
  sentence: string;
  notebookWords: WordEntry[];
  isTranslation?: boolean;
}

const COLORS = [
  'text-blue-700 bg-blue-100 border-blue-200',
  'text-green-700 bg-green-100 border-green-200',
  'text-purple-700 bg-purple-100 border-purple-200',
  'text-pink-700 bg-pink-100 border-pink-200',
  'text-amber-700 bg-amber-100 border-amber-200',
  'text-indigo-700 bg-indigo-100 border-indigo-200',
  'text-rose-700 bg-rose-100 border-rose-200',
  'text-teal-700 bg-teal-100 border-teal-200',
];

const getColorForWord = (word: string) => {
  let hash = 0;
  for (let i = 0; i < word.length; i++) {
    hash = word.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
};

export const InteractiveSentence: React.FC<InteractiveSentenceProps> = ({ sentence, notebookWords, isTranslation = false }) => {
  const targetList: { target: string, wordEntry: WordEntry }[] = [];
  
  for (const w of notebookWords) {
    if (!isTranslation) {
      if (w.word.trim()) {
        targetList.push({ target: w.word.trim().toLowerCase(), wordEntry: w });
      }
    } else {
      const parts = getMeaningTargets(w);
      for (const p of parts) {
        targetList.push({ target: p, wordEntry: w });
      }
    }
  }

  // Sort by target string length descending, then alphabetical
  targetList.sort((a, b) => b.target.length - a.target.length || a.target.localeCompare(b.target));

  const tokens: { type: 'notebook' | 'word' | 'text', text: string, notebookWord?: WordEntry }[] = [];
  
  // Use a regex that supports Unicode letters, digits, apostrophes, and hyphens
  const isWordCharRegex = /[\p{L}\p{N}'-]/u;
  
  let i = 0;
  while (i < sentence.length) {
    let matched = false;
    for (const { target, wordEntry } of targetList) {
      const substr = sentence.substring(i, i + target.length);
      if (substr.toLowerCase() === target) {
        const isPrevBoundary = i === 0 || !isWordCharRegex.test(sentence[i - 1]);
        const isNextBoundary = (i + target.length) === sentence.length || !isWordCharRegex.test(sentence[i + target.length]);
        
        if (isPrevBoundary && isNextBoundary) {
          tokens.push({
            type: 'notebook',
            text: substr,
            notebookWord: wordEntry
          });
          i += target.length;
          matched = true;
          break;
        }
      }
    }
    
    if (!matched) {
      const char = sentence[i];
      const isWordChar = isWordCharRegex.test(char);
      let j = i + 1;
      while (j < sentence.length) {
        const isNextWordChar = isWordCharRegex.test(sentence[j]);
        if (isNextWordChar === isWordChar) {
          j++;
        } else {
          break;
        }
      }
      
      const chunk = sentence.substring(i, j);
      if (isWordChar && !isTranslation) {
        tokens.push({
          type: 'word',
          text: chunk
        });
      } else {
        tokens.push({
          type: 'text',
          text: chunk
        });
      }
      i = j;
    }
  }

  return (
    <span className="leading-relaxed">
      {tokens.map((token, idx) => {
        if (token.type === 'notebook' && token.notebookWord) {
          return (
            <HoverableWord
              key={idx}
              wordStr={token.text}
              notebookWords={notebookWords}
              forcedData={token.notebookWord}
              baseWordForColor={token.notebookWord.word}
            />
          );
        } else if (token.type === 'word') {
          return (
            <HoverableWord
              key={idx}
              wordStr={token.text}
              notebookWords={notebookWords}
            />
          );
        }
        return <span key={idx}>{token.text}</span>;
      })}
    </span>
  );
};

const HoverableWord: React.FC<{ 
  wordStr: string; 
  notebookWords: WordEntry[];
  forcedData?: WordEntry;
  baseWordForColor?: string;
}> = ({ wordStr, notebookWords, forcedData, baseWordForColor }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [fetchedData, setFetchedData] = useState<WordEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLSpanElement>(null);

  const cleanWord = wordStr.toLowerCase();
  
  // Check if it exists in notebook
  const existingWord = forcedData || notebookWords.find(w => w.word.toLowerCase() === cleanWord);

  const handleMouseEnter = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    // Delay slightly to prevent flashing
    hoverTimeout.current = setTimeout(() => {
      setIsHovered(true);
      fetchIfNeeded();
    }, 400); 
  };

  const handleMouseLeave = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setIsHovered(false);
  };

  const fetchIfNeeded = async () => {
    if (existingWord || fetchedData) return;
    
    // Use promise cache to prevent multiple simultaneous fetches for the same word
    if (!fetchPromiseCache.has(cleanWord)) {
      const promise = fetch("/api/lookupWord", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: cleanWord, provider: "gemini" }),
      })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (!data) return null;
        return {
          ...data,
          id: Date.now().toString(),
          createdAt: Date.now(),
          examples: (data.examples || []).map((ex: any) => ({
            id: Math.random().toString(36).substring(2, 9),
            ...ex,
            isCustom: false
          }))
        } as WordEntry;
      })
      .catch(() => null);

      fetchPromiseCache.set(cleanWord, promise);
    }

    setIsLoading(true);
    const data = await fetchPromiseCache.get(cleanWord);
    setIsLoading(false);
    if (data) setFetchedData(data);
  };

  const popoverData = existingWord || fetchedData;
  const colorKey = baseWordForColor ? baseWordForColor.toLowerCase() : cleanWord;
  const colorClass = existingWord ? getColorForWord(colorKey) : 'text-gray-900 border-transparent';

  return (
    <span 
      ref={containerRef}
      className={`relative cursor-help ${colorClass} ${existingWord ? 'px-1 border rounded font-medium' : 'hover:text-indigo-600'} transition-colors duration-200 ${isHovered ? 'z-50' : 'z-0'}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {wordStr}
      {isHovered && (
        <span 
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 md:w-80 bg-white border border-gray-200 shadow-xl rounded-xl p-4 text-left cursor-default pointer-events-none block"
        >
          {/* Triangle pointing down */}
          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-8 border-transparent border-t-white block" />
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-200 -z-10 block" />

          {isLoading ? (
            <span className="flex items-center justify-center p-4">
              <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
            </span>
          ) : popoverData ? (
            <span className="block">
              <span className="flex items-baseline gap-2 mb-2">
                <span className="font-bold text-gray-900 text-lg capitalize block">{popoverData.word}</span>
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded uppercase">
                  {popoverData.partOfSpeech}
                </span>
              </span>
              <span className="text-gray-700 text-sm mb-3 block">
                {popoverData.senses.slice(0, 2).map((sense) => `${sense.partOfSpeech} · ${sense.context}: ${sense.meaning}`).join(" • ")}
              </span>
              
              {popoverData.examples && popoverData.examples.length > 0 && (
                <span className="mt-3 pt-3 border-t border-gray-100 block">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Ví dụ</span>
                  <span className="text-sm font-medium text-gray-800 break-words block">{popoverData.examples[0].english}</span>
                  <span className="text-xs text-gray-500 break-words block mt-0.5">{popoverData.examples[0].vietnamese}</span>
                </span>
              )}
            </span>
          ) : (
            <span className="text-sm text-gray-500 text-center block">Không tìm thấy thông tin từ này.</span>
          )}
        </span>
      )}
    </span>
  );
};
