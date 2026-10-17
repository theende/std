// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
import { assertEquals } from "@ende/assert";
import { parse } from "./parse.ts";
import { render } from "./render.ts";

interface Example {
  number: number;
  section: string;
  /** The words after `example` on the opening fence, such as `table`. */
  tags: string[];
  markdown: string;
  html: string;
}

const FENCE = "`".repeat(32);
const reHeading = /^#+ /;

// Reads the examples from a file in the spec.txt format, the way cmark-gfm's
// test/spec_tests.py does: an example is a fence of 32 backticks followed by
// `example` and optional tags, the Markdown, a line holding only `.`, the
// HTML, and a closing fence. `→` stands for a tab. Examples are numbered in
// file order, counting all of them.
function parseSpec(text: string): Example[] {
  const examples: Example[] = [];
  let state: "text" | "markdown" | "html" = "text";
  let section = "";
  let tags: string[] = [];
  let markdown = "";
  let html = "";
  for (const line of text.split(/(?<=\n)/)) {
    const trimmed = line.trim();
    if (trimmed.startsWith(`${FENCE} example`)) {
      state = "markdown";
      tags = trimmed.slice(FENCE.length + " example".length).split(/\s+/).filter(Boolean);
    } else if (trimmed === FENCE) {
      examples.push({ number: examples.length + 1, section, tags, markdown, html });
      state = "text";
      markdown = "";
      html = "";
    } else if (trimmed === ".") {
      state = "html";
    } else if (state === "markdown") {
      markdown += line.replaceAll("→", "\t");
    } else if (state === "html") {
      html += line.replaceAll("→", "\t");
    } else if (reHeading.test(line)) {
      section = line.replace(reHeading, "").trim();
    }
  }
  return examples;
}

// Heading ids aren't part of the spec's HTML.
function renderGfm(markdown: string): string {
  return render(parse(markdown, { gfm: true }), { headingIds: false });
}

const spec = parseSpec(await Ende.readTextFile(new URL("./testdata/gfm_spec.txt", import.meta.url)));
const extensions = parseSpec(await Ende.readTextFile(new URL("./testdata/gfm_extensions.txt", import.meta.url)));

// Registers an example that doesn't run, with the reason in its name.
function skip(name: string, reason: string) {
  Ende.test({ name: `${name}, skipped: ${reason}`, ignore: true, fn: () => {} });
}

// The tagfilter extension (Disallowed Raw HTML) is out of scope: render()'s
// `html` option covers that need.
const TAGFILTER = "tagfilter is out of scope";

// The extension examples of the GFM Spec. Its other examples come from
// CommonMark 0.29 and are covered by the CommonMark 0.31.2 suite.
for (const example of spec) {
  const name = `GFM spec example ${example.number} (${example.section})`;
  if (example.tags.includes("tagfilter")) {
    skip(name, TAGFILTER);
  } else if (example.tags.some(tag => ["table", "strikethrough", "autolink", "tasklist"].includes(tag))) {
    Ende.test(name, () => {
      assertEquals(renderGfm(example.markdown), example.html);
    });
  } else if (example.tags.includes("disabled") && example.section === "Task list items (extension)") {
    // The spec marks its task list examples `disabled`, and cmark-gfm's own
    // test runner skips them, because their HTML is GitHub.com's
    // (`<input disabled="" type="checkbox">`) rather than cmark-gfm's renderer
    // output. Compare the structure with the checkbox markup normalized to
    // cmark-gfm's; gfm_extensions.txt has the same inputs with cmark-gfm's HTML.
    Ende.test(`${name}, checkbox markup normalized`, () => {
      const expected = example
        .html
        .replaceAll("<input checked=\"\" disabled=\"\" type=\"checkbox\">", "<input type=\"checkbox\" checked=\"\" disabled=\"\" />")
        .replaceAll("<input disabled=\"\" type=\"checkbox\">", "<input type=\"checkbox\" disabled=\"\" />");
      assertEquals(renderGfm(example.markdown), expected);
    });
  }
}

// cmark-gfm's extension tests: tables, strikethrough, autolinks, footnotes,
// task lists, and how they interact.
for (const example of extensions) {
  const name = `cmark-gfm extensions example ${example.number} (${example.section})`;
  if (example.section === "HTML tag filter") {
    skip(name, TAGFILTER);
  } else if (example.html === "<IGNORE>\n") {
    // cmark-gfm only checks that this input doesn't crash the parser.
    Ende.test(name, () => {
      renderGfm(example.markdown);
    });
  } else {
    Ende.test(name, () => {
      assertEquals(renderGfm(example.markdown), example.html);
    });
  }
}

Ende.test("GFM spec test data has the expected extension examples", () => {
  const count = (tag: string) => spec.filter(example => example.tags.includes(tag)).length;
  assertEquals(spec.length, 672);
  assertEquals([count("table"), count("strikethrough"), count("autolink"), count("tagfilter"), count("disabled")], [8, 2, 11, 1, 2]);
  assertEquals(extensions.length, 30);
});
