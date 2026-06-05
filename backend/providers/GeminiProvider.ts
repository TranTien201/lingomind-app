import { GoogleGenAI } from "@google/genai";
import { BaseProvider } from "./BaseProvider";
import type { StructuredGenerationRequest } from "./types";

export class GeminiProvider extends BaseProvider {
  readonly name = "gemini" as const;

  supportsModel(model: string): boolean {
    return model.toLowerCase().includes("gemini");
  }

  async generateStructured<T>(request: StructuredGenerationRequest): Promise<T> {
    const { prompt, model, schema } = request;
    const apiKey = this.requireValue(this.context.apiKey || process.env.GEMINI_API_KEY, "GEMINI_API_KEY");
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { "User-Agent": "aistudio-build" } },
    });

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    return this.parseJson<T>(response.text?.trim() || "{}", request);
  }
}
