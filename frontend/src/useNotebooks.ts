import { useState, useEffect } from "react";
import { Notebook, WordEntry, ExampleSentence } from "./types";

const LOCAL_STORAGE_KEY = "eng_app_notebooks";

export function useNotebooks() {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        setNotebooks(JSON.parse(stored));
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

  const editWordTranslation = (notebookId: string, wordId: string, newTranslation: string) => {
    setNotebooks((current) =>
      current.map((nb) => {
        if (nb.id !== notebookId) return nb;
        return {
          ...nb,
          words: nb.words.map((w) => {
            if (w.id !== wordId) return w;
            return { ...w, translation: newTranslation };
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
    editWordTranslation,
    updateWord,
  };
}
