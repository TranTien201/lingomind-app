import { GeminiProvider } from "./GeminiProvider";
import { GrokProvider } from "./GrokProvider";
import { LiteLLMProvider } from "./LiteLLMProvider";
import { OpenAIProvider } from "./OpenAIProvider";
import { ProviderRegistry } from "./ProviderRegistry";

export function createProviderRegistry() {
  const registry = new ProviderRegistry();
  registry.register("gemini", (context) => new GeminiProvider(context));
  registry.register("litellm", (context) => new LiteLLMProvider(context));
  registry.register("openai", (context) => new OpenAIProvider(context));
  registry.register("grok", (context) => new GrokProvider(context));
  return registry;
}
