import { JSON_ONLY_RESPONSE_INSTRUCTION } from "./shared/jsonInstructions";

export interface AnalyzeSentencePromptInput {
  english: string;
  vietnamese: string;
}

export function buildAnalyzeSentencePrompt({ english, vietnamese }: AnalyzeSentencePromptInput): string {
  return `Hãy phân tích cấu trúc ngữ pháp của câu tiếng Anh sau và bản dịch tiếng Việt của nó. Chia chúng thành các cụm ngữ pháp tương ứng (cụm danh từ, cụm động từ, mệnh đề phụ, v.v.) sao cho khớp chính xác với nhau. Mọi phần của câu đều phải nằm trong một cụm (không được thiếu dấu câu hoặc từ nào). Trả về các cụm theo đúng thứ tự.
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
