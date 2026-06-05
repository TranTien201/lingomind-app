import { analyzeSentenceTask, type AnalyzeSentenceInput, type AnalyzeSentenceResult } from "./tasks/analyzeSentenceTask";
import { lookupWordTask, type LookupWordInput, type LookupWordResult } from "./tasks/lookupWordTask";
import { ProviderResolver } from "../providers/ProviderResolver";
import type { ProviderContext, ProviderName, StructuredOutputValidator } from "../providers/types";
import { createProviderRegistry } from "../providers/registerProviders";

export class AiService {
  private readonly registry = createProviderRegistry();
  private readonly resolver = new ProviderResolver();

  async lookupWord(input: LookupWordInput & ProviderContext & { provider?: string }): Promise<LookupWordResult> {
    return this.runTask({
      provider: input.provider,
      model: input.model,
      context: input,
      task: lookupWordTask,
      payload: { word: input.word },
    });
  }

  async analyzeSentence(input: AnalyzeSentenceInput & ProviderContext & { provider?: string }): Promise<AnalyzeSentenceResult> {
    return this.runTask({
      provider: input.provider,
      model: input.model,
      context: input,
      task: analyzeSentenceTask,
      payload: { english: input.english, vietnamese: input.vietnamese },
    });
  }

  private async runTask<TPayload, TResult>(options: {
    provider?: string;
    model?: string;
    context: ProviderContext;
    task: { buildPrompt(input: TPayload): string; schema: unknown; validator: StructuredOutputValidator<TResult>; defaultModels: Record<ProviderName, string[]> };
    payload: TPayload;
  }): Promise<TResult> {
    const providerName = this.resolver.resolve({
      provider: options.provider,
      model: options.model,
      defaultProvider: process.env.DEFAULT_AI_PROVIDER,
    });

    const provider = this.registry.create(providerName, options.context);
    const modelsToTry = options.model ? [options.model] : options.task.defaultModels[providerName];
    let lastError: unknown;

    for (const model of modelsToTry) {
      try {
        return await provider.generateStructured<TResult>({
          prompt: options.task.buildPrompt(options.payload),
          model,
          schema: options.task.schema,
          validator: options.task.validator,
        });
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError;
  }
}
