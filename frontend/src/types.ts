export interface GrammarChunk {
  english: string;
  vietnamese: string;
  type: string;
  color: string;
}

export interface ExampleSentence {
  id: string;
  topic?: string;
  english: string;
  vietnamese?: string;
  isCustom?: boolean;
  chunks?: GrammarChunk[];
}

export interface RelatedWord {
  word: string;
  partOfSpeech: string;
  translation: string;
}

export interface SynonymWord {
  word: string;
  translation: string;
  note: string;
}

export interface Collocation {
  phrase: string;
  translation: string;
}

export interface WordSense {
  partOfSpeech: string;
  context: string;
  meaning: string;
  note: string;
}

export interface WordEntry {
  id: string;
  word: string;
  partOfSpeech: string;
  senses: WordSense[];
  examples: ExampleSentence[];
  relatedWords: RelatedWord[];
  collocations?: Collocation[];
  synonyms?: SynonymWord[];
  createdAt: number;
}

export interface Notebook {
  id: string;
  name: string;
  words: WordEntry[];
  createdAt: number;
}
