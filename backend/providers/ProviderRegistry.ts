import type { AIProvider, ProviderContext, ProviderName } from "./types";

type ProviderBuilder = (context: ProviderContext) => AIProvider;

export class ProviderRegistry {
  private readonly builders = new Map<ProviderName, ProviderBuilder>();

  register(name: ProviderName, builder: ProviderBuilder) {
    this.builders.set(name, builder);
  }

  create(name: ProviderName, context: ProviderContext): AIProvider {
    const builder = this.builders.get(name);
    if (!builder) {
      throw new Error(`Unsupported provider: ${name}`);
    }

    return builder(context);
  }
}
