import { JSON_ONLY_RESPONSE_INSTRUCTION } from "./shared/jsonInstructions";

export interface AnalyzeSentencePromptInput {
  english: string;
  vietnamese: string;
}

export function buildAnalyzeSentencePrompt({ english, vietnamese }: AnalyzeSentencePromptInput): string {
  return `Analyze the grammatical structure of the following English sentence and its Vietnamese translation. Break them down into corresponding grammatical chunks (Noun phrases, verb phrases, dependent clauses, etc) that exactly map to each other. Every part of the sentence must be in a chunk (no missing punctuation or words). Return the chunks in order.
You MUST reply with a valid JSON object matching this exact schema:
{
  "chunks": [
    {
      "english": "string",
      "vietnamese": "string",
      "type": "string (e.g., Noun Phrase, Verb Phrase, Prepositional Phrase, Adjective, etc.)",
      "color": "string (Return one of these exactly: blue, green, purple, pink, amber, indigo, rose, teal. Choose the same color for the same type of grammatical phrase across the sentence.)"
    }
  ]
}

${JSON_ONLY_RESPONSE_INSTRUCTION}
English: ${english}
Vietnamese: ${vietnamese}`;
}
