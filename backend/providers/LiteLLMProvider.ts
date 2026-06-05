import { BaseProvider } from "./BaseProvider";
import type { StructuredGenerationRequest } from "./types";

export class LiteLLMProvider extends BaseProvider {
  readonly name = "litellm" as const;

  supportsModel(_model: string): boolean {
    return true;
  }

  async generateStructured<T>(request: StructuredGenerationRequest): Promise<T> {
    const { prompt, model } = request;
    const baseUrl = this.requireValue(this.context.apiUrl || process.env.LITELLM_BASE_URL, "LITELLM_BASE_URL");
    const apiKey = this.context.apiKey || process.env.LITELLM_API_KEY || "sk-dummy";

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(`LiteLLM Error: ${response.status} - ${await response.text()}`);
    }

    const data = await response.json();
    return this.parseJson<T>(data.choices[0].message.content, request);
  }
}
