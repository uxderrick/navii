/**
 * Tiny insertion-ordered LRU. Map iteration order is insertion order in JS;
 * we delete + re-set on hit to bump entries to the most-recent position. When
 * size > max, we evict the oldest (first iterator value).
 */
export class LruCache<K, V> {
  private store = new Map<K, V>();
  constructor(private readonly max: number) {}

  get(key: K): V | undefined {
    const v = this.store.get(key);
    if (v === undefined) return undefined;
    this.store.delete(key);
    this.store.set(key, v);
    return v;
  }

  set(key: K, value: V): void {
    if (this.store.has(key)) this.store.delete(key);
    this.store.set(key, value);
    if (this.store.size > this.max) {
      const oldest = this.store.keys().next().value;
      if (oldest !== undefined) this.store.delete(oldest);
    }
  }

  get size(): number {
    return this.store.size;
  }
}
