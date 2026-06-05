import { JSON_ONLY_RESPONSE_INSTRUCTION } from "./shared/jsonInstructions";

export interface LookupWordPromptInput {
  word: string;
}

export function buildLookupWordPrompt({ word }: LookupWordPromptInput): string {
  return `Provide detailed information for the English word: "${word}". Include its part of speech, Vietnamese translation, a few example sentences across different topics with Vietnamese translations, related words in its word family with different parts of speech, and common collocations or dependent prepositions (phrases typically used with this word, e.g., if it takes 'to', 'of', etc.) with Vietnamese translations.
You MUST reply with a valid JSON object matching this exact schema:
{
  "word": "string",
  "partOfSpeech": "string",
  "translation": "string",
  "examples": [
    { "topic": "string", "english": "string", "vietnamese": "string" }
  ],
  "relatedWords": [
    { "word": "string", "partOfSpeech": "string" }
  ],
  "collocations": [
    { "phrase": "string", "translation": "string" }
  ]
}

${JSON_ONLY_RESPONSE_INSTRUCTION}`;
}
