import type { ProviderName } from "./types";

export class ProviderResolver {
  resolve(input: { provider?: string; model?: string; defaultProvider?: string }): ProviderName {
    if (input.provider) {
      return input.provider as ProviderName;
    }

    const model = input.model?.toLowerCase() || "";
    if (model.includes("gemini")) return "gemini";
    if (model.startsWith("gpt-") || model.startsWith("o1") || model.startsWith("o3") || model.startsWith("o4")) return "openai";
    if (model.startsWith("grok")) return "grok";

    return (input.defaultProvider as ProviderName | undefined) || "gemini";
  }
}
