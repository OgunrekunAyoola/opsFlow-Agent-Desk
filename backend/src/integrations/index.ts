import { IntegrationProvider } from './base';
import { DummyProvider } from './DummyProvider';
import { MockApiProvider } from './MockApiProvider';

class IntegrationRegistry {
  private providers: Map<string, IntegrationProvider> = new Map();

  constructor() {
    // Register default providers
    this.register(new DummyProvider());
    this.register(new MockApiProvider());
  }

  register(provider: IntegrationProvider) {
    this.providers.set(provider.name, provider);
  }

  get(name: string): IntegrationProvider | undefined {
    return this.providers.get(name);
  }

  getAll(): IntegrationProvider[] {
    return Array.from(this.providers.values());
  }
}

export const integrationRegistry = new IntegrationRegistry();
