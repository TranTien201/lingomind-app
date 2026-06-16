import { useState, useEffect } from "react";
import { Notebook, WordEntry, ExampleSentence } from "./types";

const LOCAL_STORAGE_KEY = "eng_app_notebooks";

function migrateWordEntry(word: any): WordEntry {
  const senses = Array.isArray(word?.senses) && word.senses.length > 0
    ? word.senses
        .filter((sense: any) => sense?.meaning)
        .map((sense: any) => ({
          partOfSpeech: typeof sense.partOfSpeech === "string" && sense.partOfSpeech.trim() ? sense.partOfSpeech.trim() : (typeof word?.partOfSpeech === "string" && word.partOfSpeech.trim() ? word.partOfSpeech.trim() : "other"),
          context: typeof sense.context === "string" && sense.context.trim() ? sense.context.trim() : "Nghĩa thường gặp",
          meaning: String(sense.meaning).trim(),
          note: typeof sense.note === "string" && sense.note.trim() ? sense.note.trim() : "Cách dùng phổ biến",
        }))
    : typeof word?.translation === "string" && word.translation.trim()
      ? [{ partOfSpeech: typeof word?.partOfSpeech === "string" && word.partOfSpeech.trim() ? word.partOfSpeech.trim() : "other", context: "Nghĩa cũ", meaning: word.translation.trim(), note: "Dữ liệu được chuyển từ phiên bản trước" }]
      : [];

  return {
    ...word,
    senses,
    examples: Array.isArray(word?.examples) ? word.examples : [],
    relatedWords: Array.isArray(word?.relatedWords) ? word.relatedWords : [],
    collocations: Array.isArray(word?.collocations) ? word.collocations : [],
    synonyms: Array.isArray(word?.synonyms) ? word.synonyms : [],
  };
}

function migrateNotebook(notebook: any): Notebook {
  return {
    ...notebook,
    words: Array.isArray(notebook?.words) ? notebook.words.map(migrateWordEntry) : [],
  };
}

export function useNotebooks() {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setNotebooks(Array.isArray(parsed) ? parsed.map(migrateNotebook) : []);
      } catch (e) {
        console.error("Failed to parse notebooks", e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notebooks));
    }
  }, [notebooks, isLoaded]);

  const addNotebook = (name: string) => {
    const newNotebook: Notebook = {
      id: Date.now().toString(),
      name,
      words: [],
      createdAt: Date.now(),
    };
    setNotebooks([...notebooks, newNotebook]);
    return newNotebook.id;
  };

  const deleteNotebook = (id: string) => {
    setNotebooks(notebooks.filter((nb) => nb.id !== id));
  };

  const addWordToNotebook = (notebookId: string, wordEntry: WordEntry) => {
    setNotebooks(
      notebooks.map((nb) =>
        nb.id === notebookId
          ? { ...nb, words: [wordEntry, ...nb.words] }
          : nb
      )
    );
  };

  const renameNotebook = (id: string, name: string) => {
    setNotebooks(
      notebooks.map((nb) => (nb.id === id ? { ...nb, name } : nb))
    );
  };

  const addCustomExample = (
    notebookId: string,
    wordId: string,
    example: ExampleSentence
  ) => {
    setNotebooks((current) =>
      current.map((nb) => {
        if (nb.id !== notebookId) return nb;
        return {
          ...nb,
          words: nb.words.map((w) => {
            if (w.id !== wordId) return w;
            return {
              ...w,
              examples: [...w.examples, example],
            };
          }),
        };
      })
    );
  };

  const deleteWord = (notebookId: string, wordId: string) => {
    setNotebooks((current) =>
      current.map((nb) => {
        if (nb.id !== notebookId) return nb;
        return {
          ...nb,
          words: nb.words.filter((w) => w.id !== wordId),
        };
      })
    );
  };

  const editWordSenses = (notebookId: string, wordId: string, senses: WordEntry["senses"]) => {
    setNotebooks((current) =>
      current.map((nb) => {
        if (nb.id !== notebookId) return nb;
        return {
          ...nb,
          words: nb.words.map((w) => {
            if (w.id !== wordId) return w;
            return { ...w, senses };
          }),
        };
      })
    );
  };

  const updateWord = (notebookId: string, updatedWord: WordEntry) => {
    setNotebooks((current) =>
      current.map((nb) => {
        if (nb.id !== notebookId) return nb;
        return {
          ...nb,
          words: nb.words.map((w) => (w.id === updatedWord.id ? updatedWord : w)),
        };
      })
    );
  };

  return {
    notebooks,
    isLoaded,
    addNotebook,
    deleteNotebook,
    addWordToNotebook,
    renameNotebook,
    addCustomExample,
    deleteWord,
    editWordSenses,
    updateWord,
  };
}
