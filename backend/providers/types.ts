export type ProviderName = "gemini" | "litellm" | "openai" | "grok";

export interface StructuredOutputValidator<T> {
  parse(data: unknown): T;
}

export interface ProviderContext {
  apiKey?: string;
  apiUrl?: string;
  model?: string;
}

export interface StructuredGenerationRequest {
  prompt: string;
  model: string;
  schema?: unknown;
  validator?: StructuredOutputValidator<unknown>;
}

export interface AIProvider {
  readonly name: ProviderName;
  supportsModel(model: string): boolean;
  generateStructured<T>(request: StructuredGenerationRequest): Promise<T>;
}
