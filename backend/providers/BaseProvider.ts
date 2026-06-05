import type { AIProvider, ProviderContext, ProviderName, StructuredGenerationRequest } from "./types";

export abstract class BaseProvider implements AIProvider {
  abstract readonly name: ProviderName;

  constructor(protected readonly context: ProviderContext) {}

  abstract supportsModel(model: string): boolean;

  abstract generateStructured<T>(request: StructuredGenerationRequest): Promise<T>;

  protected parseJson<T>(text: string, request?: StructuredGenerationRequest): T {
    let normalized = text.trim();
    if (normalized.startsWith("```json")) {
      normalized = normalized.replace(/^```json/, "").replace(/```$/, "").trim();
    }
    const parsed = JSON.parse(normalized) as unknown;
    return request?.validator ? (request.validator.parse(parsed) as T) : (parsed as T);
  }

  protected requireValue(value: string | undefined, label: string): string {
    if (!value) {
      throw new Error(`${label} is missing`);
    }

    return value;
  }
}
