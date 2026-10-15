// Copyright 2018-2026 the Deno authors. MIT license.
// This module is browser compatible.

/**
 * Name string is a fully-qualified domain name.
 *
 * @example Usage
 * ```ts
 * import { NAMESPACE_DNS } from "@ende/uuid/constants";
 * import { generate } from "@ende/uuid/v5";
 *
 * await generate(NAMESPACE_DNS, new TextEncoder().encode("ende.sh"));
 * ```
 */
export const NAMESPACE_DNS = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
/**
 * Name string is a URL.
 *
 * @example Usage
 * ```ts
 * import { NAMESPACE_URL } from "@ende/uuid/constants";
 * import { generate } from "@ende/uuid/v3";
 *
 * await generate(NAMESPACE_URL, new TextEncoder().encode("https://ende.sh"));
 * ```
 */
export const NAMESPACE_URL = "6ba7b811-9dad-11d1-80b4-00c04fd430c8";
/**
 * Name string is an ISO OID.
 *
 * @example Usage
 * ```ts
 * import { NAMESPACE_OID } from "@ende/uuid/constants";
 * import { generate } from "@ende/uuid/v5";
 *
 * await generate(NAMESPACE_OID, new TextEncoder().encode("1.3.6.1.2.1.1.1"));
 * ```
 */
export const NAMESPACE_OID = "6ba7b812-9dad-11d1-80b4-00c04fd430c8";
/**
 * Name string is an X.500 DN (in DER or a text output format).
 *
 * @example Usage
 * ```ts
 * import { NAMESPACE_X500 } from "@ende/uuid/constants";
 * import { generate } from "@ende/uuid/v3";
 *
 * await generate(NAMESPACE_X500, new TextEncoder().encode("CN=John Doe, OU=People, O=Example.com"));
 * ```
 */
export const NAMESPACE_X500 = "6ba7b814-9dad-11d1-80b4-00c04fd430c8";
/**
 * The nil UUID is special form of UUID that is specified to have all 128 bits
 * set to zero.
 */
export const NIL_UUID = "00000000-0000-0000-0000-000000000000";
