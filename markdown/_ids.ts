// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
// This module is browser compatible.

/**
 * The ids used so far in a document. `unique()` makes an id unique the way
 * github-slugger does: a taken id gets `-1`, then `-2` and so on, counted per
 * original id.
 */
export class IdSet {
  readonly #occurrences = new Map<string, number>();

  /** Returns `id`, or a numbered variant if it's taken, and marks it taken. */
  unique(id: string): string {
    let result = id;
    while (this.#occurrences.has(result)) {
      const count = this.#occurrences.get(id)! + 1;
      this.#occurrences.set(id, count);
      result = `${id}-${count}`;
    }
    this.#occurrences.set(result, 0);
    return result;
  }
}
