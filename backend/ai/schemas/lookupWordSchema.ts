import { Type } from "@google/genai";
import { z } from "zod";

export const lookupWordExampleSchema = z.object({
  topic: z.string().min(1),
  english: z.string().min(1),
  vietnamese: z.string().min(1),
});

export const lookupWordRelatedWordSchema = z.object({
  word: z.string().min(1),
  partOfSpeech: z.string().min(1),
  translation: z.string().min(1),
});

export const lookupWordCollocationSchema = z.object({
  phrase: z.string().min(1),
  translation: z.string().min(1),
});

export const lookupWordSynonymSchema = z.object({
  word: z.string().min(1),
  translation: z.string().min(1),
  note: z.string().min(1),
});

export const lookupWordSenseSchema = z.object({
  partOfSpeech: z.string().min(1),
  context: z.string().min(1),
  meaning: z.string().min(1),
  note: z.string().min(1),
});

export const lookupWordResponseSchema = z.object({
  word: z.string().min(1),
  partOfSpeech: z.string().min(1),
  senses: z.array(lookupWordSenseSchema).min(1),
  examples: z.array(lookupWordExampleSchema),
  relatedWords: z.array(lookupWordRelatedWordSchema),
  collocations: z.array(lookupWordCollocationSchema),
  synonyms: z.array(lookupWordSynonymSchema),
});

export type LookupWordResult = z.infer<typeof lookupWordResponseSchema>;

export const lookupWordResponseJsonSchema = {
  type: Type.OBJECT,
  properties: {
    word: { type: Type.STRING },
    partOfSpeech: { type: Type.STRING },
    senses: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          partOfSpeech: { type: Type.STRING },
          context: { type: Type.STRING },
          meaning: { type: Type.STRING },
          note: { type: Type.STRING },
        },
        required: ["partOfSpeech", "context", "meaning", "note"],
      },
    },
    examples: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING },
          english: { type: Type.STRING },
          vietnamese: { type: Type.STRING },
        },
        required: ["topic", "english", "vietnamese"],
      },
    },
    relatedWords: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          word: { type: Type.STRING },
          partOfSpeech: { type: Type.STRING },
          translation: { type: Type.STRING },
        },
        required: ["word", "partOfSpeech", "translation"],
      },
    },
    collocations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          phrase: { type: Type.STRING },
          translation: { type: Type.STRING },
        },
        required: ["phrase", "translation"],
      },
    },
    synonyms: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          word: { type: Type.STRING },
          translation: { type: Type.STRING },
          note: { type: Type.STRING },
        },
        required: ["word", "translation", "note"],
      },
    },
  },
  required: ["word", "partOfSpeech", "senses", "examples", "relatedWords", "collocations", "synonyms"],
} as const;
