// Copyright 2018-2026 the Deno authors. MIT license.

import { assertEquals, assertThrows } from "@std/assert";
import { assertType, type IsExact } from "@std/testing/types";
import {
  type CacheControl,
  formatCacheControl,
  parseCacheControl,
  type RequestCacheControl,
  type ResponseCacheControl,
} from "./unstable_cache_control.ts";

Ende.test("parseCacheControl() returns empty object for null", () => {
  assertEquals(parseCacheControl(null), {});
});

Ende.test("parseCacheControl() returns empty object for empty string", () => {
  assertEquals(parseCacheControl(""), {});
  assertEquals(parseCacheControl("   "), {});
});

Ende.test("parseCacheControl() parses single boolean directive", () => {
  assertEquals(parseCacheControl("no-store"), { noStore: true });
  assertEquals(parseCacheControl("no-cache"), { noCache: true });
  assertEquals(parseCacheControl("public"), { public: true });
  assertEquals(parseCacheControl("immutable"), { immutable: true });
});

Ende.test("parseCacheControl() parses single valued directive", () => {
  assertEquals(parseCacheControl("max-age=3600"), { maxAge: 3600 });
  assertEquals(parseCacheControl("s-maxage=0"), { sMaxage: 0 });
  assertEquals(parseCacheControl("stale-while-revalidate=60"), {
    staleWhileRevalidate: 60,
  });
});

Ende.test("parseCacheControl() parses multiple directives", () => {
  assertEquals(
    parseCacheControl("max-age=300, private, must-revalidate"),
    { maxAge: 300, private: true, mustRevalidate: true },
  );
});

Ende.test("parseCacheControl() parses no-cache with field names", () => {
  assertEquals(parseCacheControl('no-cache="foo"'), { noCache: ["foo"] });
  assertEquals(parseCacheControl('no-cache="foo, bar"'), {
    noCache: ["foo", "bar"],
  });
});

Ende.test("parseCacheControl() parses private with field names", () => {
  assertEquals(parseCacheControl('private="x-custom"'), {
    private: ["x-custom"],
  });
});

Ende.test("parseCacheControl() parses max-stale with and without value", () => {
  assertEquals(parseCacheControl("max-stale"), { maxStale: true });
  assertEquals(parseCacheControl("max-stale=120"), { maxStale: 120 });
});

Ende.test("parseCacheControl() is case insensitive", () => {
  assertEquals(parseCacheControl("NO-STORE"), { noStore: true });
  assertEquals(parseCacheControl("Max-Age=100"), { maxAge: 100 });
});

Ende.test("parseCacheControl() ignores unknown directives", () => {
  assertEquals(parseCacheControl("no-store, unknown=1, no-cache"), {
    noStore: true,
    noCache: true,
  });
});

Ende.test("parseCacheControl() ignores malformed numeric values", () => {
  assertEquals(parseCacheControl("max-age=abc"), {});
  assertEquals(parseCacheControl("max-age=-1"), {});
  assertEquals(parseCacheControl("s-maxage=1.5"), {});
  assertEquals(parseCacheControl("max-stale=abc"), {});
});

Ende.test("parseCacheControl() ignores valued directives without a value", () => {
  assertEquals(parseCacheControl("max-age"), {});
  assertEquals(parseCacheControl("stale-while-revalidate"), {});
});

Ende.test("parseCacheControl() keeps well-formed directives when others are malformed", () => {
  assertEquals(
    parseCacheControl("max-age=abc, no-store, s-maxage=600"),
    { noStore: true, sMaxage: 600 },
  );
});

Ende.test("parseCacheControl() ignores duplicates after a malformed first occurrence", () => {
  assertEquals(parseCacheControl("max-age=abc, max-age=100"), {});
});

Ende.test("formatCacheControl() returns empty string for empty object", () => {
  assertEquals(formatCacheControl({}), "");
});

Ende.test("formatCacheControl() serializes boolean directives", () => {
  assertEquals(formatCacheControl({ noStore: true }), "no-store");
  assertEquals(
    formatCacheControl({ noStore: true, noTransform: true }),
    "no-store, no-transform",
  );
});

Ende.test("formatCacheControl() serializes valued directives", () => {
  assertEquals(formatCacheControl({ maxAge: 3600 }), "max-age=3600");
  assertEquals(
    formatCacheControl({ maxAge: 0, sMaxage: 100 }),
    "max-age=0, s-maxage=100",
  );
});

Ende.test("formatCacheControl() serializes no-cache and private with field names", () => {
  assertEquals(
    formatCacheControl({ noCache: ["foo", "bar"] }),
    'no-cache="foo, bar"',
  );
  assertEquals(
    formatCacheControl({ private: ["x-custom"] }),
    'private="x-custom"',
  );
});

Ende.test("formatCacheControl() round-trip", () => {
  const value =
    "max-age=300, private, must-revalidate, stale-while-revalidate=60";
  const parsed = parseCacheControl(value);
  const formatted = formatCacheControl(parsed);
  const reparsed = parseCacheControl(formatted);
  assertEquals(parsed, reparsed);
  assertEquals(
    formatted,
    "max-age=300, private, must-revalidate, stale-while-revalidate=60",
  );
});

Ende.test("formatCacheControl() throws on negative number", () => {
  assertThrows(
    () => formatCacheControl({ maxAge: -1 }),
    RangeError,
    "non-negative integer",
  );
});

Ende.test("formatCacheControl() throws on NaN", () => {
  assertThrows(
    () => formatCacheControl({ maxAge: NaN }),
    RangeError,
    "non-negative integer",
  );
});

Ende.test("parseCacheControl() parses min-fresh", () => {
  assertEquals(parseCacheControl("min-fresh=30"), { minFresh: 30 });
});

Ende.test("parseCacheControl() ignores min-fresh without a value", () => {
  assertEquals(parseCacheControl("min-fresh"), {});
});

Ende.test("parseCacheControl() parses stale-if-error", () => {
  assertEquals(parseCacheControl("stale-if-error=300"), {
    staleIfError: 300,
  });
});

Ende.test("parseCacheControl() ignores stale-if-error without a value", () => {
  assertEquals(parseCacheControl("stale-if-error"), {});
});

Ende.test("parseCacheControl() ignores s-maxage without a value", () => {
  assertEquals(parseCacheControl("s-maxage"), {});
});

Ende.test("parseCacheControl() parses no-transform", () => {
  assertEquals(parseCacheControl("no-transform"), { noTransform: true });
});

Ende.test("parseCacheControl() parses only-if-cached", () => {
  assertEquals(parseCacheControl("only-if-cached"), { onlyIfCached: true });
});

Ende.test("parseCacheControl() parses must-understand", () => {
  assertEquals(parseCacheControl("must-understand"), {
    mustUnderstand: true,
  });
});

Ende.test("parseCacheControl() parses proxy-revalidate", () => {
  assertEquals(parseCacheControl("proxy-revalidate"), {
    proxyRevalidate: true,
  });
});

Ende.test("parseCacheControl() uses first occurrence for duplicate directives", () => {
  assertEquals(parseCacheControl("max-age=100, max-age=200"), { maxAge: 100 });
});

Ende.test(
  "parseCacheControl() uses first occurrence when request-leaning directives repeat",
  () => {
    assertEquals(
      parseCacheControl(
        [
          "max-stale, max-stale=9",
          "min-fresh=10, min-fresh=20",
          'no-cache="a", no-cache="b"',
          "no-store, no-store",
          "no-transform, no-transform",
          "only-if-cached, only-if-cached",
        ].join(", "),
      ),
      {
        maxStale: true,
        minFresh: 10,
        noCache: ["a"],
        noStore: true,
        noTransform: true,
        onlyIfCached: true,
      },
    );
  },
);

Ende.test(
  "parseCacheControl() uses first occurrence when response-leaning directives repeat",
  () => {
    assertEquals(
      parseCacheControl(
        [
          "must-revalidate, must-revalidate",
          "must-understand, must-understand",
          "proxy-revalidate, proxy-revalidate",
          "public, public",
          "s-maxage=1, s-maxage=2",
          'private="x", private="y"',
          "immutable, immutable",
          "stale-while-revalidate=1, stale-while-revalidate=2",
          "stale-if-error=1, stale-if-error=2",
        ].join(", "),
      ),
      {
        mustRevalidate: true,
        mustUnderstand: true,
        proxyRevalidate: true,
        public: true,
        sMaxage: 1,
        private: ["x"],
        immutable: true,
        staleWhileRevalidate: 1,
        staleIfError: 1,
      },
    );
  },
);

Ende.test("parseCacheControl() clamps values above 2^31 to 2147483648", () => {
  assertEquals(parseCacheControl("max-age=9999999999"), {
    maxAge: 2_147_483_648,
  });
});

Ende.test("formatCacheControl() clamps values above 2^31 to 2147483648", () => {
  assertEquals(
    formatCacheControl({ maxAge: 9_999_999_999 }),
    "max-age=2147483648",
  );
});

Ende.test("formatCacheControl() serializes empty array as bare directive", () => {
  assertEquals(formatCacheControl({ noCache: [] }), "no-cache");
  assertEquals(formatCacheControl({ private: [] }), "private");
});

Ende.test("formatCacheControl() serializes max-stale boolean", () => {
  assertEquals(formatCacheControl({ maxStale: true }), "max-stale");
});

Ende.test("formatCacheControl() serializes max-stale with value", () => {
  assertEquals(formatCacheControl({ maxStale: 120 }), "max-stale=120");
});

Ende.test("formatCacheControl() serializes all response directives", () => {
  assertEquals(
    formatCacheControl({
      maxAge: 300,
      noCache: true,
      noStore: true,
      noTransform: true,
      sMaxage: 600,
      private: true,
      public: true,
      mustRevalidate: true,
      proxyRevalidate: true,
      mustUnderstand: true,
      immutable: true,
      staleWhileRevalidate: 60,
      staleIfError: 300,
    }),
    "max-age=300, no-cache, no-store, no-transform, s-maxage=600, private, public, must-revalidate, proxy-revalidate, must-understand, immutable, stale-while-revalidate=60, stale-if-error=300",
  );
});

Ende.test("parseCacheControl() splits correctly when quotes contain commas", () => {
  assertEquals(
    parseCacheControl('no-cache="foo, bar", max-age=60'),
    { noCache: ["foo", "bar"], maxAge: 60 },
  );
});

Ende.test("parseCacheControl() parses private with unquoted value", () => {
  assertEquals(parseCacheControl("private=foo"), { private: ["foo"] });
});

Ende.test("parseCacheControl() handles trailing and leading commas", () => {
  assertEquals(parseCacheControl(",no-store,"), { noStore: true });
});

Ende.test("parseCacheControl() return type is CacheControl", () => {
  const cc = parseCacheControl("no-store");
  assertType<IsExact<typeof cc, CacheControl>>(true);
});

Ende.test("parseCacheControl() splits correctly when quoted values contain escaped quotes", () => {
  assertEquals(
    parseCacheControl('no-cache="x-\\"header", max-age=60'),
    { noCache: ['x-"header'], maxAge: 60 },
  );
});

Ende.test("parseCacheControl() normalizes no-cache with empty value to true", () => {
  assertEquals(parseCacheControl("no-cache="), { noCache: true });
  assertEquals(parseCacheControl('no-cache=""'), { noCache: true });
});

Ende.test("parseCacheControl() normalizes private with empty value to true", () => {
  assertEquals(parseCacheControl("private="), { private: true });
  assertEquals(parseCacheControl('private=""'), { private: true });
});

Ende.test("parseCacheControl() round-trips no-cache with empty value", () => {
  const parsed = parseCacheControl("no-cache=");
  const formatted = formatCacheControl(parsed);
  const reparsed = parseCacheControl(formatted);
  assertEquals(parsed, reparsed);
});

Ende.test("formatCacheControl() accepts RequestCacheControl and ResponseCacheControl", () => {
  const req: RequestCacheControl = { maxStale: true, noStore: true };
  const res: ResponseCacheControl = { maxAge: 3600, public: true };
  formatCacheControl(req);
  formatCacheControl(res);
  assertType<
    IsExact<
      Parameters<typeof formatCacheControl>[0],
      CacheControl
    >
  >(true);
});

Ende.test("parseCacheControl() accepts quoted-string form for numeric arguments", () => {
  assertEquals(parseCacheControl('max-age="60"'), { maxAge: 60 });
  assertEquals(parseCacheControl('s-maxage="0"'), { sMaxage: 0 });
  assertEquals(parseCacheControl('stale-while-revalidate="30"'), {
    staleWhileRevalidate: 30,
  });
  assertEquals(parseCacheControl('max-stale="120"'), { maxStale: 120 });
});

Ende.test("parseCacheControl() ignores quoted-string with non-digit content", () => {
  assertEquals(parseCacheControl('max-age="abc"'), {});
});

Ende.test("parseCacheControl() unescapes backslash quoted-pairs in field names", () => {
  assertEquals(
    parseCacheControl('no-cache="x-\\\\header"'),
    { noCache: ["x-\\header"] },
  );
});

Ende.test("formatCacheControl() throws on invalid field-name characters", () => {
  assertThrows(
    () => formatCacheControl({ noCache: ['has"quote'] }),
    TypeError,
    "invalid field name",
  );
  assertThrows(
    () => formatCacheControl({ private: ["has space"] }),
    TypeError,
    "invalid field name",
  );
  assertThrows(
    () => formatCacheControl({ noCache: [""] }),
    TypeError,
    "invalid field name",
  );
});
