export type Factory<T> = (container: Container) => T;

export class Container {
  private readonly factories = new Map<string, Factory<unknown>>();
  private readonly singletons = new Set<string>();
  private readonly instances = new Map<string, unknown>();
  private readonly resolving = new Set<string>();

  register<T>(key: string, factory: Factory<T>): this {
    this.factories.set(key, factory as Factory<unknown>);
    return this;
  }

  registerSingleton<T>(key: string, factory: Factory<T>): this {
    this.factories.set(key, factory as Factory<unknown>);
    this.singletons.add(key);
    return this;
  }

  get<T>(key: string): T {
    if (this.instances.has(key)) {
      return this.instances.get(key) as T;
    }
    const factory = this.factories.get(key);
    if (!factory) {
      throw new Error(`No factory registered for container key "${key}"`);
    }
    if (this.resolving.has(key)) {
      throw new Error(`Circular dependency detected for container key "${key}"`);
    }
    this.resolving.add(key);
    try {
      const instance = factory(this);
      if (this.singletons.has(key)) {
        this.instances.set(key, instance);
      }
      return instance as T;
    } finally {
      this.resolving.delete(key);
    }
  }

  has(key: string): boolean {
    return this.factories.has(key) && !this.resolving.has(key);
  }
}
