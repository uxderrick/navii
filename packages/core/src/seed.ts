/**
 * Seed helper — composes the most stable identifier from a user-shaped
 * object into a single string for `createAvatar`.
 *
 * Priority: `id` → `email` → `name + createdAt` → `name` alone.
 *
 * The whole point: stop devs accidentally passing a display name. Names
 * collide; ids and emails don't. When only a name is available, composing
 * it with `createdAt` makes the result globally unique while remaining
 * stable across renders (assuming `createdAt` is set once at signup).
 */

export interface SeedFields {
  /** Stable primary key (database id, UUID, OAuth sub). Best choice. */
  id?: string | number | null | undefined;
  /** Email. Stable + unique. Good fallback when id isn't available client-side. */
  email?: string | null | undefined;
  /** Display name. Collision-prone — only acceptable composed with `createdAt`. */
  name?: string | null | undefined;
  /** Account creation time. Combined with `name` to bake uniqueness in at signup. */
  createdAt?: string | number | Date | null | undefined;
}

/**
 * Compose a stable seed string from the most unique field available.
 *
 * @example
 * ```ts
 * const s = seed({ id: user.id, email: user.email, name: user.name });
 * createAvatar(s);
 * ```
 *
 * @example If only a name exists, pass `createdAt` to avoid collisions:
 * ```ts
 * seed({ name: 'Alice', createdAt: user.createdAt });
 * // → "Alice|1700000000000"
 * ```
 *
 * @throws if no usable field is provided.
 */
export function seed(fields: SeedFields): string {
  if (fields.id !== null && fields.id !== undefined && String(fields.id).length > 0) {
    return String(fields.id);
  }
  if (fields.email && fields.email.length > 0) {
    return fields.email;
  }
  if (fields.name && fields.name.length > 0) {
    if (fields.createdAt !== null && fields.createdAt !== undefined) {
      const ts = fields.createdAt instanceof Date
        ? fields.createdAt.getTime()
        : typeof fields.createdAt === 'number'
          ? fields.createdAt
          : Date.parse(fields.createdAt as string);
      if (Number.isFinite(ts)) return `${fields.name}|${ts}`;
      return `${fields.name}|${fields.createdAt}`;
    }
    return fields.name;
  }
  throw new Error('navii: seed() requires at least one of { id, email, name }');
}
