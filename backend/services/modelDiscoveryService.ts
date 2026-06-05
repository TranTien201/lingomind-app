import { GoogleGenAI } from "@google/genai";

export type DiscoverProviderName = "gemini" | "litellm" | "openai" | "grok";

export interface DiscoverModelsInput {
  provider: DiscoverProviderName;
  apiUrl?: string;
  apiKey?: string;
}

export interface DiscoverModelsResult {
  models: string[];
}

export async function discoverModels(input: DiscoverModelsInput): Promise<DiscoverModelsResult> {
  switch (input.provider) {
    case "gemini":
      return { models: await discoverGeminiModels(input.apiKey) };
    case "openai":
      return { models: await discoverOpenAiCompatibleModels(input.apiUrl || process.env.OPENAI_BASE_URL || "https://api.openai.com/v1", input.apiKey || process.env.OPENAI_API_KEY) };
    case "grok":
      return { models: await discoverOpenAiCompatibleModels(input.apiUrl || process.env.GROK_BASE_URL || process.env.XAI_BASE_URL || "https://api.x.ai/v1", input.apiKey || process.env.GROK_API_KEY || process.env.XAI_API_KEY) };
    case "litellm":
      return { models: await discoverOpenAiCompatibleModels(input.apiUrl || process.env.LITELLM_BASE_URL, input.apiKey || process.env.LITELLM_API_KEY || "sk-dummy") };
    default:
      return { models: [] };
  }
}

async function discoverGeminiModels(apiKey?: string): Promise<string[]> {
  const resolvedApiKey = requireValue(apiKey || process.env.GEMINI_API_KEY, "GEMINI_API_KEY");
  const ai = new GoogleGenAI({
    apiKey: resolvedApiKey,
    httpOptions: { headers: { "User-Agent": "aistudio-build" } },
  });

  const pager = await ai.models.list();
  const models: string[] = [];

  for await (const model of pager) {
    const name = model.name?.replace(/^models\//, "") || "";
    if (name && !name.toLowerCase().includes("embedding") && !name.toLowerCase().includes("image")) {
      models.push(name);
    }
  }

  models.sort((a, b) => a.localeCompare(b));

  return unique(models);
}

async function discoverOpenAiCompatibleModels(apiUrl?: string, apiKey?: string): Promise<string[]> {
  const baseUrl = requireValue(apiUrl, "apiUrl");
  const response = await fetch(joinModelsUrl(baseUrl), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${requireValue(apiKey, "apiKey")}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Model discovery failed: ${response.status} - ${await response.text()}`);
  }

  const data = await response.json() as { data?: Array<{ id?: string }> };
  const models = (data.data || [])
    .map((item) => item.id || "")
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  return unique(models);
}

function joinModelsUrl(baseUrl: string): string {
  return `${baseUrl.replace(/\/$/, "")}/models`;
}

function requireValue(value: string | undefined, label: string): string {
  if (!value) {
    throw new Error(`${label} is missing`);
  }

  return value;
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}
