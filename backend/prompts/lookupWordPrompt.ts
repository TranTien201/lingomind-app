import { JSON_ONLY_RESPONSE_INSTRUCTION } from "./shared/jsonInstructions";

export interface LookupWordPromptInput {
  word: string;
}

export function buildLookupWordPrompt({ word }: LookupWordPromptInput): string {
  return `Hãy cung cấp thông tin chi tiết cho từ tiếng Anh: "${word}". Toàn bộ nội dung giải thích, nghĩa, bản dịch và mô tả phải chỉ được viết bằng tiếng Việt; không dùng tiếng Nga hoặc bất kỳ ngôn ngữ nào khác ngoài tiếng Việt, ngoại trừ chính từ đang được tra cứu và câu ví dụ tiếng Anh. Bao gồm từ loại, nhiều nghĩa tiếng Việt theo từng ngữ cảnh khác nhau, một vài câu ví dụ ở các chủ đề khác nhau kèm bản dịch tiếng Việt, các từ liên quan trong cùng họ từ với từ loại khác nhau, các từ đồng nghĩa thông dụng, và các collocation hoặc giới từ đi kèm phổ biến (những cụm thường dùng với từ này, ví dụ: nếu nó đi với 'to', 'of', v.v.) kèm nghĩa tiếng Việt.
You MUST reply with a valid JSON object matching this exact schema:
{
  "word": "string",
  "partOfSpeech": "Tóm tắt tất cả từ loại của từ này bằng ký hiệu tiếng Anh, ví dụ: adj; v; n",
  "senses": [
    {
      "partOfSpeech": "Ký hiệu từ loại tiếng Anh ngắn gọn như adj, adv, n, v, phrasal v, prep",
      "context": "Tên ngữ cảnh ngắn gọn bằng tiếng Việt, ví dụ: đính chính, nhấn mạnh sự thật, hội thoại hằng ngày",
      "meaning": "Nghĩa tiếng Việt trong ngữ cảnh đó, chỉ viết bằng tiếng Việt",
      "note": "Ghi chú rất ngắn bằng tiếng Việt về sắc thái hoặc cách dùng trong ngữ cảnh này"
    }
  ],
  "examples": [
    { "topic": "Chủ đề bằng tiếng Việt", "english": "Câu ví dụ tiếng Anh", "vietnamese": "Bản dịch tiếng Việt, chỉ dùng tiếng Việt" }
  ],
  "relatedWords": [
    { "word": "string", "partOfSpeech": "Từ loại bằng tiếng Việt", "translation": "Nghĩa tiếng Việt ngắn gọn của từ này, chỉ dùng tiếng Việt" }
  ],
  "collocations": [
    { "phrase": "string", "translation": "Nghĩa tiếng Việt, chỉ dùng tiếng Việt" }
  ],
  "synonyms": [
    { "word": "string", "translation": "Nghĩa tiếng Việt ngắn gọn, chỉ dùng tiếng Việt", "note": "Ghi chú rất ngắn bằng tiếng Việt về sắc thái hoặc ngữ cảnh dùng nếu cần" }
  ]
}

Yêu cầu thêm cho mảng "senses":
- Phải trả ít nhất 2 nghĩa nếu từ có nhiều cách dùng phổ biến; với từ rất đa nghĩa thì ưu tiên 3-5 nghĩa thông dụng nhất.
- Mỗi nghĩa phải có trường "partOfSpeech" bằng đúng **một** ký hiệu từ loại tiếng Anh ngắn gọn như: adj, adv, n, v, modal v, phrasal v, prep, conj.
- Không được gộp nhiều từ loại trong một nghĩa. Ví dụ không ghi "prep; adv" hoặc "adj/adv" cho một sense.
- Nếu một từ có cả nghĩa danh từ và động từ thì phải tách thành các sense riêng, mỗi sense chỉ mang đúng từ loại của nghĩa đó.
- Phải xác định từ loại dựa trên chính nghĩa đang mô tả, không được sao chép cùng một từ loại cho mọi sense nếu các nghĩa thực tế khác nhau.
- Mỗi nghĩa phải đại diện cho một ngữ cảnh hoặc sắc thái khác nhau, không lặp lại cùng một ý bằng cách diễn đạt khác.
- Trường "context" phải ngắn, dễ hiểu, phù hợp để làm nhãn hiển thị.
- Trường "meaning" phải là nghĩa tự nhiên trong tiếng Việt, không nhồi nhiều nghĩa vào cùng một dòng.
- Trường "note" phải ngắn và giúp người học phân biệt khi nào nên dùng nghĩa đó.

Yêu cầu thêm cho mảng "relatedWords":
- Mỗi từ trong họ từ phải có nghĩa tiếng Việt ngắn gọn, tự nhiên và đúng với từ đó trong trường "translation".
- Nghĩa này dùng để hiển thị khi người dùng hover, nên phải ngắn, rõ và chỉ dùng tiếng Việt.

Yêu cầu thêm cho mảng "synonyms":
- Chỉ trả các từ đồng nghĩa thực sự thông dụng và phù hợp với từ gốc.
- Mỗi từ đồng nghĩa phải có nghĩa tiếng Việt ngắn gọn trong trường "translation".
- Trường "note" dùng để ghi rất ngắn sắc thái khác biệt, mức độ trang trọng, hoặc ngữ cảnh dùng; nếu không có khác biệt rõ thì ghi ngắn gọn như "dùng phổ biến".
- Không trả từ trái nghĩa hoặc từ chỉ gần nghĩa quá xa.

${JSON_ONLY_RESPONSE_INSTRUCTION}`;
}
