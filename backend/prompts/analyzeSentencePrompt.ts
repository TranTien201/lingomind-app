import { JSON_ONLY_RESPONSE_INSTRUCTION } from "./shared/jsonInstructions";

export interface AnalyzeSentencePromptInput {
  english: string;
  vietnamese: string;
}

export function buildAnalyzeSentencePrompt({ english, vietnamese }: AnalyzeSentencePromptInput): string {
  return `Hãy phân tích cấu trúc ngữ pháp của câu tiếng Anh sau và bản dịch tiếng Việt của nó một cách cực kỳ chặt chẽ và bảo toàn đúng cấu trúc câu gốc.

Mục tiêu:
- Chia câu thành các cụm ngữ pháp hoặc thành phần cú pháp tự nhiên, đúng chức năng trong câu.
- Ưu tiên phân tích theo cấu trúc ngữ pháp thực tế của câu, không tách máy móc theo từng từ nếu chúng thuộc cùng một cụm.
- Căn chỉnh mỗi cụm tiếng Anh với đúng phần nghĩa tiếng Việt tương ứng nhất về chức năng và ý nghĩa.

Quy tắc bắt buộc:
- Phải xác định đúng chủ ngữ, vị ngữ, tân ngữ, bổ ngữ, trạng ngữ, cụm giới từ, mệnh đề, động từ khuyết thiếu, động từ chính, và các thành phần phụ trợ nếu có.
- Với các cấu trúc như modal verb + main verb, verb phrase, infinitive phrase, gerund phrase, phrasal verb, prepositional phrase, noun phrase, relative clause..., hãy giữ chúng theo cụm có nghĩa ngữ pháp hoàn chỉnh, không chia sai ranh giới.
- Không được gộp sai các phần có chức năng khác nhau. Ví dụ, trong câu "Students must strictly follow the exam rules", cần hiểu "Students" là chủ ngữ; "must strictly follow" là cụm động từ; "the exam rules" là cụm danh từ/tân ngữ. Không được tách theo cách làm sai quan hệ cú pháp cốt lõi.
- Mọi từ và mọi dấu câu trong câu tiếng Anh đều phải xuất hiện đúng một lần trong mảng chunks, theo đúng thứ tự từ trái sang phải, không thiếu và không lặp.
- Phần tiếng Việt cũng phải được chia theo các cụm tương ứng tự nhiên nhất với từng cụm tiếng Anh, không cần bám 1-1 từng từ nhưng phải đúng nghĩa và đúng vai trò ngữ pháp.
- Nếu bản dịch tiếng Việt không bám hoàn toàn cấu trúc tiếng Anh, vẫn phải ưu tiên phân tích đúng cấu trúc tiếng Anh trước, sau đó ghép phần tiếng Việt tương ứng hợp lý nhất.
- Chỉ dùng các nhãn type ngắn gọn, rõ nghĩa, nhất quán bằng tiếng Anh như: Subject, Verb Phrase, Object, Noun Phrase, Prepositional Phrase, Adverbial, Complement, Clause, Relative Clause, Conjunction, Determiner, Modal, Auxiliary Verb.
- Chọn màu nhất quán: cùng một loại type trong cùng câu nên dùng cùng một màu.

Trước khi trả kết quả, tự kiểm tra nội bộ:
- Các chunks ghép lại phải khôi phục đầy đủ câu tiếng Anh gốc theo đúng thứ tự.
- Cấu trúc cú pháp chính của câu phải hợp lý về mặt ngữ pháp.
- Không chia tách khiến người học hiểu sai thành phần chính của câu.

Nếu có nhiều cách chia, hãy chọn cách chia giúp người học hiểu cấu trúc câu chuẩn xác nhất.
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
