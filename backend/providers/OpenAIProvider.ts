import { BaseProvider } from "./BaseProvider";
import type { StructuredGenerationRequest } from "./types";

export class OpenAIProvider extends BaseProvider {
  readonly name = "openai" as const;

  supportsModel(model: string): boolean {
    const normalized = model.toLowerCase();
    return normalized.startsWith("gpt-") || normalized.startsWith("o1") || normalized.startsWith("o3") || normalized.startsWith("o4");
  }

  async generateStructured<T>(request: StructuredGenerationRequest): Promise<T> {
    const { prompt, model } = request;
    const apiKey = this.requireValue(this.context.apiKey || process.env.OPENAI_API_KEY, "OPENAI_API_KEY");
    const apiUrl = this.context.apiUrl || process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";

    const response = await fetch(`${apiUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI Error: ${response.status} - ${await response.text()}`);
    }

    const data = await response.json();
    return this.parseJson<T>(data.choices[0].message.content, request);
  }
}
