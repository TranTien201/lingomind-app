import { BaseProvider } from "./BaseProvider";
import type { StructuredGenerationRequest } from "./types";

export class GrokProvider extends BaseProvider {
  readonly name = "grok" as const;

  supportsModel(model: string): boolean {
    return model.toLowerCase().startsWith("grok");
  }

  async generateStructured<T>(request: StructuredGenerationRequest): Promise<T> {
    const { prompt, model } = request;
    const apiKey = this.requireValue(this.context.apiKey || process.env.GROK_API_KEY || process.env.XAI_API_KEY, "GROK_API_KEY");
    const apiUrl = this.context.apiUrl || process.env.GROK_BASE_URL || process.env.XAI_BASE_URL || "https://api.x.ai/v1";

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
      throw new Error(`Grok Error: ${response.status} - ${await response.text()}`);
    }

    const data = await response.json();
    return this.parseJson<T>(data.choices[0].message.content, request);
  }
}
