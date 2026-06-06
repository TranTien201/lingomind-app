import { BaseProvider } from "./BaseProvider";
import type { StructuredGenerationRequest } from "./types";
import { terminalLogger } from "../logging/TerminalLogger";

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
    const url = `${apiUrl}/chat/completions`;
    const requestBody = {
      model,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    };
    const startedAt = Date.now();

    terminalLogger.logProviderCallStart({
      requestId: this.context.requestId,
      provider: this.name,
      model,
      url,
      prompt,
      requestBody,
    });

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      const rawText = await response.text();

      if (!response.ok) {
        terminalLogger.logProviderCallError({
          requestId: this.context.requestId,
          provider: this.name,
          model,
          url,
          durationMs: Date.now() - startedAt,
          prompt,
          requestBody,
          rawResponse: rawText,
          error: new Error(`OpenAI Error: ${response.status} - ${rawText}`),
        });
        throw new Error(`OpenAI Error: ${response.status} - ${rawText}`);
      }

      const data = JSON.parse(rawText);
      const parsed = this.parseJson<T>(data.choices[0].message.content, request);

      terminalLogger.logProviderCallEnd({
        requestId: this.context.requestId,
        provider: this.name,
        model,
        url,
        statusCode: response.status,
        durationMs: Date.now() - startedAt,
        rawResponse: data,
        parsedResult: parsed,
      });

      return parsed;
    } catch (error) {
      if (!(error instanceof Error && error.message.startsWith("OpenAI Error:"))) {
        terminalLogger.logProviderCallError({
          requestId: this.context.requestId,
          provider: this.name,
          model,
          url,
          durationMs: Date.now() - startedAt,
          prompt,
          requestBody,
          error,
        });
      }

      throw error;
    }
  }
}
