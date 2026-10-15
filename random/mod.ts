// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
// This module is browser compatible.

/**
 * Utilities for generating random numbers.
 *
 * Example of generating a random integer with fixed seed number:
 *
 * ```ts
 * import { randomIntegerBetween } from "@ende/random";
 * import { randomSeeded } from "@ende/random";
 * import { assertEquals } from "@ende/assert";
 *
 * const prng = randomSeeded(1n);
 *
 * assertEquals(randomIntegerBetween(1, 10, { prng }), 3);
 * ```
 *
 * Example of generating a random integer between two values:
 *
 * ```ts no-assert
 * import { randomIntegerBetween } from "@ende/random";
 * import { randomSeeded } from "@ende/random";
 *
 * const prng = randomSeeded(BigInt(crypto.getRandomValues(new Uint32Array(1))[0]!));
 *
 * const randomInteger = randomIntegerBetween(1, 10, { prng });
 * ```
 *
 * @experimental **UNSTABLE**: New API, yet to be vetted.
 *
 * @module
 */

export * from "./between.ts";
export * from "./integer_between.ts";
export * from "./get_random_values_seeded.ts";
export * from "./next_float_64.ts";
export * from "./sample.ts";
export * from "./seeded.ts";
export * from "./shuffle.ts";
