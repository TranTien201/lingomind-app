import { JSON_ONLY_RESPONSE_INSTRUCTION } from "./shared/jsonInstructions";

export interface LookupWordPromptInput {
  word: string;
}

export function buildLookupWordPrompt({ word }: LookupWordPromptInput): string {
  return `Hãy cung cấp thông tin chi tiết cho từ tiếng Anh: "${word}". Bao gồm từ loại, nghĩa tiếng Việt, một vài câu ví dụ ở các chủ đề khác nhau kèm bản dịch tiếng Việt, các từ liên quan trong cùng họ từ với từ loại khác nhau, và các collocation hoặc giới từ đi kèm phổ biến (những cụm thường dùng với từ này, ví dụ: nếu nó đi với 'to', 'of', v.v.) kèm nghĩa tiếng Việt.
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
