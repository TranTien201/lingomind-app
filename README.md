# LingoMinds AI

Ứng dụng học từ vựng tiếng Anh thông minh được hỗ trợ bởi AI. Tạo sổ tay theo chủ đề, thêm từ vựng, và hệ thống AI sẽ tự động cung cấp loại từ, bản dịch tiếng Việt, ví dụ đa dạng thuộc nhiều chủ đề, họ từ liên quan, và cụm từ cố định (collocations).

## Tính năng

- **Tạo sổ tay theo chủ đề** - Tổ chức từ vựng của bạn theo các chủ đề khác nhau (IELTS, Business, Du lịch, ...)
- **Tra cứu từ vựng với AI** - Nhập một từ tiếng Anh, AI sẽ trả về:
  - Loại từ (part of speech)
  - Bản dịch tiếng Việt
  - Ví dụ mẫu theo nhiều chủ đề (mỗi ví dụ đi kèm dịch tiếng Việt)
  - Họ từ liên quan (word family) với loại từ tương ứng
  - Cụm từ cố định / collocations với bản dịch
- **Phân tích cú pháp câu** - Nhấn nút phép màu (wand) trên từng câu ví dụ để AI phân tích cấu trúc ngữ pháp, chia câu thành các chunk (Noun Phrase, Verb Phrase, ...) với màu sắc trực quan cho cả tiếng Anh và tiếng Việt
- **Interactive Sentence** - Trong các câu ví dụ, các từ đã có trong sổ tay của bạn được highlight với màu sắc và hover để xem thông tin nhanh (popover). Các từ chưa có trong sổ tay cũng có thể hover để tra cứu nhanh qua AI
- **Thêm ví dụ tùy chỉnh** - Tự thêm câu ví dụ bằng tiếng Anh (và tiếng Việt tùy chọn) vào bất kỳ từ nào
- **Chỉnh sửa bản dịch** - Sửa trực tiếp nghĩa tiếng Việt của từ nếu bạn muốn điều chỉnh
- **Tìm kiếm** - Lọc nhanh từ vựng trong sổ tay theo từ hoặc nghĩa tiếng Việt
- **Sidebar có thể resize** - Kéo giãn sidebar theo ý muốn (200px - 600px), đóng/mở trên desktop
- **Nhiều cấu hình AI** - Tạo và chuyển đổi giữa nhiều cấu hình kết nối AI (Gemini, OpenAI, Grok, LiteLLM)
- **Auto-discover models** - Tự động tải danh sách model khả dụng từ API của từng provider
- **Persistence** - Dữ liệu sổ tay lưu trong localStorage (frontend), cấu hình AI lưu trong JSON file (backend)

## Kiến trúc

```
├── frontend/                    # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── App.tsx              # Component chính: sidebar + notebook detail + settings
│   │   ├── main.tsx             # Entry point
│   │   ├── types.ts             # TypeScript types (Notebook, WordEntry, ...)
│   │   ├── index.css            # Tailwind CSS + fonts
│   │   ├── useNotebooks.ts      # Custom hook: quản lý sổ tay (localStorage)
│   │   ├── useSettings.ts       # Custom hook: quản lý cài đặt AI (API)
│   │   └── components/
│   │       ├── NotebookDetail.tsx    # Hiển thị danh sách từ vựng trong sổ tay + tra từ
│   │       ├── InteractiveSentence.tsx  # Câu ví dụ với từ sổ tay được highlight + hover
│   │       ├── AnalyzedSentence.tsx     # Câu ví dụ sau khi được AI phân tích cú pháp
│   │       └── SettingsDialog.tsx       # Modal cài đặt: chọn provider, model, API key
│   └── index.html
│
├── backend/                     # Express + API routes
│   ├── server.ts                # Express server (dev: Vite middleware, prod: static)
│   ├── ai/
│   │   ├── AiService.ts         # Service chính: lookupWord + analyzeSentence
│   │   ├── tasks/
│   │   │   ├── lookupWordTask.ts        # Task: tra từ (prompt, schema, validator, default models)
│   │   │   └── analyzeSentenceTask.ts   # Task: phân tích cú pháp câu
│   │   └── schemas/
│   │       ├── lookupWordSchema.ts        # Zod schema + JSON schema cho tra từ
│   │       └── analyzeSentenceSchema.ts   # Zod schema + JSON schema cho phân tích câu
│   ├── providers/
│   │   ├── types.ts                   # Interface AIProvider, ProviderName
│   │   ├── BaseProvider.ts            # Abstract class: parseJson, requireValue
│   │   ├── ProviderRegistry.ts        # Registry: register + create providers
│   │   ├── ProviderResolver.ts        # Resolver: auto-detect provider từ model name
│   │   ├── registerProviders.ts       # Factory: tạo registry với 4 providers
│   │   ├── GeminiProvider.ts          # Google Gemini (native structured output)
│   │   ├── OpenAIProvider.ts          # OpenAI (JSON mode)
│   │   ├── GrokProvider.ts            # xAI Grok (JSON mode)
│   │   └── LiteLLMProvider.ts         # LiteLLM / OpenAI Compatible
│   ├── prompts/
│   │   ├── lookupWordPrompt.ts           # Prompt: tra từ vựng
│   │   ├── analyzeSentencePrompt.ts      # Prompt: phân tích cú pháp câu
│   │   └── shared/jsonInstructions.ts    # Shared: "Reply JSON only" instruction
│   ├── routes/
│   │   ├── aiRoutes.ts                    # POST /api/lookupWord, POST /api/analyzeSentence
│   │   └── providerConnectionsRoutes.ts   # GET/PUT /api/provider-connections, POST /api/provider-connections/discover-models
│   ├── services/
│   │   └── modelDiscoveryService.ts       # Auto-discover models từ Gemini / OpenAI-compatible APIs
│   └── storage/
│       ├── providerConnectionStore.ts     # CRUD provider connections (JSON file)
│       └── provider-connections.json      # Persisted provider connections
```

## Flow công việc

### Tra từ vựng (Look up a word)

1. User nhập từ trong ô tìm kiếm của sổ tay
2. Frontend gọi `POST /api/lookupWord` với từ + cấu hình AI (provider, model, apiUrl, apiKey)
3. Backend (`AiService`) resolve provider, chọn model, gọi AI qua provider tương ứng
4. AI trả về JSON: word, partOfSpeech, translation, examples[], relatedWords[], collocations[]
5. Zod validate output → hiển thị Word Card với đầy đủ thông tin

### Phân tích cú pháp câu (Analyze a sentence)

1. User hover vào câu ví dụ, click nút wand icon
2. Frontend gọi `POST /api/analyzeSentence` với câu tiếng Anh + tiếng Việt
3. Backend gọi AI với task analyzeSentence
4. AI trả về JSON: chunks[] (mỗi chunk: english, vietnamese, type, color)
5. Câu được hiển thị lại với các chunk được highlight theo màu sắc

### Interactive Sentence

1. Trong câu ví dụ, từ đã có trong sổ tay được highlight và hover để xem popover (definition + ví dụ)
2. Từ chưa có trong sổ tay nhưng là tiếng Anh: hover → tự động gọi AI tra từ → hiển thị popover

### Cấu hình AI (Settings)

1. User click Settings icon → modal mở
2. Chọn hoặc tạo mới cấu hình (connection)
3. Cấu hình bao gồm: provider, apiUrl, apiKey, model
4. Click "Tải danh sách model" → gọi `POST /api/provider-connections/discover-models`
5. Chọn model từ danh sách → lưu xuống backend (JSON file)

## Môi trường (Environment Variables)

Sao chép `.env.example` thành `.env.local`:

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Yes* | API key cho Google Gemini |
| `OPENAI_API_KEY` | No | API key cho OpenAI (có thể dùng từ UI) |
| `OPENAI_BASE_URL` | No | Base URL OpenAI (default: `https://api.openai.com/v1`) |
| `GROK_API_KEY` | No | API key cho xAI Grok (có thể dùng từ UI) |
| `GROK_BASE_URL` | No | Base URL Grok (default: `https://api.x.ai/v1`) |
| `LITELLM_BASE_URL` | No | Base URL LiteLLM (default: `http://localhost:4000`) |
| `LITELLM_API_KEY` | No | API key LiteLLM (default: `sk-dummy`) |
| `LITELLM_MODEL` | No | Model mặc định LiteLLM (default: `gpt-3.5-turbo`) |
| `DEFAULT_AI_PROVIDER` | No | Provider mặc định (default: `gemini`) |

\* Bạn cũng có thể cấp API key qua UI Settings thay vì dùng env.

## Cài đặt và Chạy

**Yêu cầu:** Node.js 20+

### Cài đặt

```bash
npm install
```

### Chạy Development

```bash
npm run dev
# hoặc
make dev

# App chạy tại http://localhost:3000
# Backend mount Vite dev middleware trong chế độ development
```

### Build Production

```bash
npm run build
# hoặc
make build
```

### Chạy Production

```bash
npm run start
# hoặc
make start
```

### Clean

```bash
npm run clean
```

### Lint (TypeScript check)

```bash
npm run lint
```

## Các API Endpoint

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/lookupWord` | Tra chi tiết từ vựng (word, provider?, model?, apiUrl?, apiKey?) |
| `POST` | `/api/analyzeSentence` | Phân tích cú pháp câu (english, vietnamese, provider?, model?, apiUrl?, apiKey?) |
| `GET` | `/api/provider-connections` | Lấy danh sách cấu hình AI đã lưu |
| `PUT` | `/api/provider-connections` | Lưu danh sách cấu hình AI (activeConnectionId, connections[]) |
| `POST` | `/api/provider-connections/discover-models` | Tự động tìm model từ provider (provider, apiUrl?, apiKey?) |

## Provider / Model hỗ trợ

| Provider | Transport | Structured Output | Default Models |
|---|---|---|---|
| **Gemini** | Native `@google/genai` SDK + JSON schema | ✅ Native | gemini-3.5-flash, gemini-2.0-flash |
| **OpenAI** | REST `fetch` + JSON mode | ✅ `response_format: json_object` | gpt-4o-mini |
| **Grok / xAI** | REST `fetch` + JSON mode | ✅ `response_format: json_object` | grok-2-latest |
| **LiteLLM** | REST `fetch` | ⚠️ Prompt-based (no native JSON mode) | gpt-3.5-turbo |

> Provider được auto-resolve theo tên model nếu không chỉ định: chứa "gemini" → Gemini, bắt đầu "gpt-" / "o1" / "o3" / "o4" → OpenAI, bắt đầu "grok" → Grok, mặc định là `DEFAULT_AI_PROVIDER` hoặc "gemini".

> Nếu model đầu tiên của list default models thất bại, hệ thống sẽ thử các model tiếp theo trong danh sách (fallback chain).

## Technology Stack

- **Frontend:** React 19, Vite 6, TypeScript, Tailwind CSS 4, framer-motion, lucide-react
- **Backend:** Express, TypeScript, tsx (runtime)
- **AI:** Google Gemini (@google/genai), OpenAI, xAI Grok, LiteLLM
- **Validation:** Zod 4
- **Build:** Vite (frontend), esbuild (backend)
- **Persist:** localStorage (notebooks), file system JSON (provider connections)
- **Font:** Inter (body), Space Grotesk (display)
