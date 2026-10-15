// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.

import { assertEquals, assertThrows } from "@ende/assert";
import { parseSync } from "./_parse_sync.ts";
import { XmlSyntaxError } from "./types.ts";

// =============================================================================
// XML Declaration Variations
// =============================================================================

Ende.test("parseSync() handles declaration with single quotes", () => {
  const doc = parseSync("<?xml version='1.0' encoding='UTF-8'?><root/>");

  assertEquals(doc.declaration?.version, "1.0");
  assertEquals(doc.declaration?.encoding, "UTF-8");
});

Ende.test("parseSync() handles declaration with standalone", () => {
  const doc = parseSync('<?xml version="1.0" standalone="yes"?><root/>');

  assertEquals(doc.declaration?.version, "1.0");
  assertEquals(doc.declaration?.standalone, "yes");
});

// =============================================================================
// DOCTYPE Handling
// =============================================================================

Ende.test("parseSync() rejects DOCTYPE by default", () => {
  assertThrows(
    () => parseSync("<!DOCTYPE root><root/>"),
    XmlSyntaxError,
    "DOCTYPE declarations are not allowed",
  );
});

Ende.test("parseSync() handles DOCTYPE with internal subset", () => {
  const doc = parseSync(
    `<!DOCTYPE root [
    <!ELEMENT root (#PCDATA)>
  ]><root/>`,
    { disallowDoctype: false },
  );

  assertEquals(doc.root.name.local, "root");
});

Ende.test("parseSync() handles DOCTYPE with nested brackets in internal subset", () => {
  // This tests the nested bracket depth tracking
  const doc = parseSync(
    `<!DOCTYPE root [
    <!-- Comment with [brackets] inside -->
    <!ENTITY test "[nested [brackets] here]">
  ]><root/>`,
    { disallowDoctype: false },
  );

  assertEquals(doc.root.name.local, "root");
});

// =============================================================================
// Empty Text Node Handling
// =============================================================================

Ende.test("parseSync() handles adjacent tags without text between them", () => {
  // This tests the empty text check
  const doc = parseSync("<root><a/><b/></root>");

  assertEquals(doc.root.children.length, 2);
  if (doc.root.children[0]!.type === "element") {
    assertEquals(doc.root.children[0]!.name.local, "a");
  }
  if (doc.root.children[1]!.type === "element") {
    assertEquals(doc.root.children[1]!.name.local, "b");
  }
});

// =============================================================================
// Error Handling: End of Input
// =============================================================================

Ende.test("parseSync() throws on unexpected end after <", () => {
  assertThrows(
    () => parseSync("<root><"),
    XmlSyntaxError,
    "Unexpected end of input",
  );
});

Ende.test("parseSync() throws on unexpected end in start tag", () => {
  // Input ends after whitespace in tag, before any attribute or closing
  assertThrows(
    () => parseSync("<root "),
    XmlSyntaxError,
    "Unexpected end of input in start tag",
  );
});

// =============================================================================
// Error Handling: End Tags
// =============================================================================

Ende.test("parseSync() throws on missing > in end tag", () => {
  assertThrows(
    () => parseSync("<root></root"),
    XmlSyntaxError,
  );
});

Ende.test("parseSync() throws on unexpected closing tag", () => {
  assertThrows(
    () => parseSync("</orphan>"),
    XmlSyntaxError,
    "Unexpected closing tag",
  );
});

Ende.test("parseSync() throws on mismatched closing tag", () => {
  assertThrows(
    () => parseSync("<root></wrong>"),
    XmlSyntaxError,
    "Mismatched closing tag",
  );
});

Ende.test("parseSync() throws on mismatched namespaced closing tag", () => {
  assertThrows(
    () => parseSync('<ns:root xmlns:ns="http://example.com"></ns:wrong>'),
    XmlSyntaxError,
    "Mismatched closing tag: expected </ns:root>",
  );
});

// =============================================================================
// Namespace URI Resolution
// =============================================================================

Ende.test("parseSync() resolves namespace URI for prefixed element", () => {
  const doc = parseSync(
    '<ns:root xmlns:ns="http://example.com"><ns:child/></ns:root>',
  );

  assertEquals(doc.root.name.prefix, "ns");
  assertEquals(doc.root.name.uri, "http://example.com");

  const child = doc.root.children[0];
  assertEquals(child?.type, "element");
  if (child?.type === "element") {
    assertEquals(child.name.prefix, "ns");
    assertEquals(child.name.uri, "http://example.com");
  }
});

Ende.test("parseSync() resolves xml namespace URI implicitly", () => {
  const doc = parseSync('<root xml:lang="en"/>');

  // The xml prefix is always bound to the XML namespace
  assertEquals(doc.root.name.uri, undefined); // root has no prefix
});

Ende.test("parseSync() does not assign URI to unprefixed elements", () => {
  const doc = parseSync("<root><child/></root>");

  assertEquals(doc.root.name.prefix, undefined);
  assertEquals(doc.root.name.uri, undefined);
});

Ende.test("parseSync() handles multiple namespace prefixes", () => {
  const doc = parseSync(`
    <root xmlns:a="http://a.example.com" xmlns:b="http://b.example.com">
      <a:elem1/>
      <b:elem2/>
    </root>
  `);

  const children = doc.root.children.filter((c) => c.type === "element");
  assertEquals(children.length, 2);

  const elem1 = children[0];
  const elem2 = children[1];

  if (elem1?.type === "element" && elem2?.type === "element") {
    assertEquals(elem1.name.prefix, "a");
    assertEquals(elem1.name.uri, "http://a.example.com");
    assertEquals(elem2.name.prefix, "b");
    assertEquals(elem2.name.uri, "http://b.example.com");
  }
});

// =============================================================================
// Error Handling: Unclosed Elements
// =============================================================================

Ende.test("parseSync() throws on unclosed element", () => {
  assertThrows(
    () => parseSync("<root><child>"),
    XmlSyntaxError,
    "Unclosed element",
  );
});

Ende.test("parseSync() throws on unclosed namespaced element", () => {
  assertThrows(
    () => parseSync('<ns:root xmlns:ns="http://example.com">'),
    XmlSyntaxError,
    "Unclosed element <ns:root>",
  );
});

// =============================================================================
// Error Handling: Unterminated Constructs
// =============================================================================

Ende.test("parseSync() throws on unterminated comment", () => {
  assertThrows(
    () => parseSync("<root><!-- unterminated"),
    XmlSyntaxError,
    "Unterminated comment",
  );
});

Ende.test("parseSync() throws on -- inside comment", () => {
  assertThrows(
    () => parseSync("<root><!-- a--b --></root>"),
    XmlSyntaxError,
    "Cannot use '--' within comments",
  );
});

Ende.test("parseSync() throws on unterminated CDATA", () => {
  assertThrows(
    () => parseSync("<root><![CDATA[unterminated"),
    XmlSyntaxError,
    "Unterminated CDATA",
  );
});

Ende.test("parseSync() throws on unterminated processing instruction", () => {
  assertThrows(
    () => parseSync("<?xml version='1.0'"),
    XmlSyntaxError,
    "Unterminated processing instruction",
  );
});

// =============================================================================
// Error Handling: Invalid Characters
// =============================================================================

Ende.test("parseSync() throws on unexpected character after <", () => {
  assertThrows(
    () => parseSync("<root><@invalid/></root>"),
    XmlSyntaxError,
    "Unexpected character",
  );
});

Ende.test("parseSync() throws on unexpected character in start tag", () => {
  assertThrows(
    () => parseSync("<root @/>"),
    XmlSyntaxError,
    "Unexpected character",
  );
});

// =============================================================================
// Error Handling: Attribute Errors
// =============================================================================

Ende.test("parseSync() throws on < in attribute value", () => {
  assertThrows(
    () => parseSync('<root attr="<"/>'),
    XmlSyntaxError,
    "Cannot use '<' in attribute value",
  );
});

Ende.test("parseSync() throws on unterminated attribute value", () => {
  assertThrows(
    () => parseSync('<root attr="unterminated'),
    XmlSyntaxError,
    "Unterminated attribute value",
  );
});

Ende.test("parseSync() throws on missing quote for attribute value", () => {
  assertThrows(
    () => parseSync("<root attr=unquoted/>"),
    XmlSyntaxError,
    "Expected quote to start attribute value",
  );
});

Ende.test("parseSync() throws on missing = after attribute name", () => {
  assertThrows(
    () => parseSync('<root attr "value"/>'),
    XmlSyntaxError,
    "Expected '=' after attribute name",
  );
});

// =============================================================================
// Error Handling: Self-Closing Tags
// =============================================================================

Ende.test("parseSync() throws on missing > after / in self-closing tag", () => {
  assertThrows(
    () => parseSync("<root/x"),
    XmlSyntaxError,
    "Expected '>' after '/' in self-closing tag",
  );
});

// =============================================================================
// Error Handling: Markup Declarations
// =============================================================================

Ende.test("parseSync() throws on unsupported markup declaration", () => {
  assertThrows(
    () => parseSync("<root><!INVALID></root>"),
    XmlSyntaxError,
    "Unsupported markup declaration",
  );
});

// =============================================================================
// Comment with newlines (line position tracking)
// =============================================================================

Ende.test("parseSync() tracks line position in multi-line comments", () => {
  // Tests newline tracking inside comments
  const doc = parseSync(`<root><!-- line1
line2
line3 --><item/></root>`);

  assertEquals(doc.root.children.length, 2);
  // First child is comment, second is element
  if (doc.root.children[0]!.type === "comment") {
    assertEquals(doc.root.children[0]!.text, " line1\nline2\nline3 ");
  }
});

// =============================================================================
// Multi-line CDATA position tracking
// =============================================================================

Ende.test("parseSync() tracks line position in multi-line CDATA", () => {
  // Tests newline tracking inside CDATA
  const doc = parseSync(`<root><![CDATA[line1
line2
line3]]></root>`);

  assertEquals(doc.root.children.length, 1);
  if (doc.root.children[0]!.type === "cdata") {
    assertEquals(doc.root.children[0]!.text, "line1\nline2\nline3");
  }
});

Ende.test("parseSync() tracks line position in multi-line processing instruction", () => {
  // Tests newline tracking inside PI content
  // PI content with newlines - should not throw
  const doc = parseSync(`<?xml version="1.0"?>
<?target content
  with newlines
  here?>
<root/>`);

  assertEquals(doc.root.name.local, "root");
  assertEquals(doc.declaration?.version, "1.0");
});

// =============================================================================
// Empty text fast path test
// =============================================================================

Ende.test("parseSync() handles adjacent elements with no text between", () => {
  // Tests line 178: empty text fast path when text.length === 0
  const doc = parseSync("<root><a></a><b></b></root>");
  assertEquals(doc.root.children.length, 2);
  // Verify no empty text nodes were created
  assertEquals(
    doc.root.children.every((c) => c.type === "element"),
    true,
  );
});

// =============================================================================
// Additional Coverage Tests
// =============================================================================

Ende.test("parseSync() handles CRLF line endings", () => {
  // Tests line ending normalization (CRLF -> LF)
  const doc = parseSync("<root>\r\n  <child/>\r\n</root>");
  assertEquals(doc.root.children.length, 3); // whitespace, child, whitespace
});

Ende.test("parseSync() handles CR line endings", () => {
  // Tests line ending normalization (CR -> LF)
  const doc = parseSync("<root>\r  <child/>\r</root>");
  assertEquals(doc.root.children.length, 3);
});

Ende.test("parseSync() with trackPosition false reports zero positions", () => {
  // Tests that position is 0,0,0 when trackPosition is false
  try {
    parseSync("<root><unclosed>", { trackPosition: false });
  } catch (e) {
    if (e instanceof XmlSyntaxError) {
      assertEquals(e.line, 0);
      assertEquals(e.column, 0);
      assertEquals(e.offset, 0);
      return;
    }
  }
  throw new Error("Expected XmlSyntaxError");
});

Ende.test("parseSync() with trackPosition false omits position from error message", () => {
  try {
    parseSync("<root><unclosed>", { trackPosition: false });
  } catch (e) {
    if (e instanceof XmlSyntaxError) {
      assertEquals(e.message, "Unclosed element <unclosed>");
      return;
    }
  }
  throw new Error("Expected XmlSyntaxError");
});

Ende.test("parseSync() extracts standalone yes from declaration", () => {
  // Tests standalone attribute extraction
  const doc = parseSync('<?xml version="1.0" standalone="yes"?><root/>');
  assertEquals(doc.declaration?.standalone, "yes");
});

Ende.test("parseSync() extracts standalone no from declaration", () => {
  const doc = parseSync('<?xml version="1.0" standalone="no"?><root/>');
  assertEquals(doc.declaration?.standalone, "no");
});

Ende.test("parseSync() extracts standalone with single quotes", () => {
  const doc = parseSync("<?xml version='1.0' standalone='yes'?><root/>");
  assertEquals(doc.declaration?.standalone, "yes");
});

// =============================================================================
// DTD ENTITY Declaration Tests
// =============================================================================

Ende.test("parseSync() handles ENTITY with SYSTEM identifier", () => {
  const doc = parseSync(
    `<!DOCTYPE root [
    <!ENTITY external SYSTEM "http://example.com/entity.xml">
  ]><root/>`,
    { disallowDoctype: false },
  );
  assertEquals(doc.root.name.local, "root");
});

Ende.test("parseSync() handles ENTITY with PUBLIC identifier", () => {
  const doc = parseSync(
    `<!DOCTYPE root [
    <!ENTITY external PUBLIC "-//Example//EN" "http://example.com/entity.xml">
  ]><root/>`,
    { disallowDoctype: false },
  );
  assertEquals(doc.root.name.local, "root");
});

Ende.test("parseSync() handles ENTITY with NDATA declaration", () => {
  const doc = parseSync(
    `<!DOCTYPE root [
    <!ENTITY logo SYSTEM "logo.png" NDATA png>
  ]><root/>`,
    { disallowDoctype: false },
  );
  assertEquals(doc.root.name.local, "root");
});

Ende.test("parseSync() handles parameter entity declaration", () => {
  const doc = parseSync(
    `<!DOCTYPE root [
    <!ENTITY % common "INCLUDE">
  ]><root/>`,
    { disallowDoctype: false },
  );
  assertEquals(doc.root.name.local, "root");
});

Ende.test("parseSync() throws on parameter entity with NDATA", () => {
  assertThrows(
    () =>
      parseSync(
        `<!DOCTYPE root [
      <!ENTITY % logo SYSTEM "logo.png" NDATA png>
    ]><root/>`,
        { disallowDoctype: false },
      ),
    XmlSyntaxError,
    "Parameter entities cannot have NDATA declarations",
  );
});

Ende.test("parseSync() throws on lowercase system keyword", () => {
  assertThrows(
    () =>
      parseSync(
        `<!DOCTYPE root [
      <!ENTITY test system "test.xml">
    ]><root/>`,
        { disallowDoctype: false },
      ),
    XmlSyntaxError,
    "must be uppercase 'SYSTEM'",
  );
});

Ende.test("parseSync() throws on lowercase public keyword", () => {
  assertThrows(
    () =>
      parseSync(
        `<!DOCTYPE root [
      <!ENTITY test public "-//Test//EN" "test.xml">
    ]><root/>`,
        { disallowDoctype: false },
      ),
    XmlSyntaxError,
    "must be uppercase 'PUBLIC'",
  );
});

// =============================================================================
// DTD Declaration Validation Tests
// =============================================================================

Ende.test("parseSync() handles ELEMENT declaration", () => {
  const doc = parseSync(
    `<!DOCTYPE root [
    <!ELEMENT root (item*)>
  ]><root/>`,
    { disallowDoctype: false },
  );
  assertEquals(doc.root.name.local, "root");
});

Ende.test("parseSync() handles ATTLIST declaration", () => {
  const doc = parseSync(
    `<!DOCTYPE root [
    <!ATTLIST root id ID #IMPLIED>
  ]><root/>`,
    { disallowDoctype: false },
  );
  assertEquals(doc.root.name.local, "root");
});

Ende.test("parseSync() handles NOTATION declaration", () => {
  const doc = parseSync(
    `<!DOCTYPE root [
    <!NOTATION png SYSTEM "image/png">
  ]><root/>`,
    { disallowDoctype: false },
  );
  assertEquals(doc.root.name.local, "root");
});

Ende.test("parseSync() handles comment in internal subset", () => {
  const doc = parseSync(
    `<!DOCTYPE root [
    <!-- This is a comment in the DTD -->
  ]><root/>`,
    { disallowDoctype: false },
  );
  assertEquals(doc.root.name.local, "root");
});

Ende.test("parseSync() handles PI in internal subset", () => {
  const doc = parseSync(
    `<!DOCTYPE root [
    <?target content?>
  ]><root/>`,
    { disallowDoctype: false },
  );
  assertEquals(doc.root.name.local, "root");
});

Ende.test("parseSync() handles parameter entity reference in internal subset", () => {
  const doc = parseSync(
    `<!DOCTYPE root [
    %common;
  ]><root/>`,
    { disallowDoctype: false },
  );
  assertEquals(doc.root.name.local, "root");
});

Ende.test("parseSync() throws on unknown DTD declaration type", () => {
  assertThrows(
    () =>
      parseSync(
        `<!DOCTYPE root [
      <!INVALID test>
    ]><root/>`,
        { disallowDoctype: false },
      ),
    XmlSyntaxError,
    "Unknown DTD declaration type",
  );
});

Ende.test("parseSync() throws on conditional section in internal subset", () => {
  // Conditional sections start with <![INCLUDE or <![IGNORE
  // The parser sees <![, expects CDATA[, but gets something else
  assertThrows(
    () =>
      parseSync(
        `<!DOCTYPE root [
      <![INCLUDE[
        <!ELEMENT root (#PCDATA)>
      ]]>
    ]><root/>`,
        { disallowDoctype: false },
      ),
    XmlSyntaxError,
    // The parser sees <! followed by [ which is the conditional section marker
    "Unknown DTD declaration type",
  );
});

// =============================================================================
// Content Before/After Root Tests
// =============================================================================

Ende.test("parseSync() throws on text before root element", () => {
  assertThrows(
    () => parseSync("text<root/>"),
    XmlSyntaxError,
    "Cannot have content before the root element",
  );
});

Ende.test("parseSync() throws on text after root element", () => {
  assertThrows(
    () => parseSync("<root/>text"),
    XmlSyntaxError,
    "Cannot have content after the root element",
  );
});

Ende.test("parseSync() throws on entity reference before root", () => {
  assertThrows(
    () => parseSync("&amp;<root/>"),
    XmlSyntaxError,
    "Cannot use character/entity references in prolog",
  );
});

Ende.test("parseSync() throws on entity reference after root", () => {
  assertThrows(
    () => parseSync("<root/>&amp;"),
    XmlSyntaxError,
    "Cannot use character/entity references in prolog/epilog",
  );
});

Ende.test("parseSync() throws on CDATA before root element", () => {
  assertThrows(
    () => parseSync("<![CDATA[test]]><root/>"),
    XmlSyntaxError,
    "Cannot have CDATA section before the root element",
  );
});

Ende.test("parseSync() throws on CDATA after root element", () => {
  assertThrows(
    () => parseSync("<root/><![CDATA[test]]>"),
    XmlSyntaxError,
    "Cannot have CDATA section after the root element",
  );
});

Ende.test("parseSync() throws on multiple root elements", () => {
  assertThrows(
    () => parseSync("<root1/><root2/>"),
    XmlSyntaxError,
    "Only one root element is allowed",
  );
});

// =============================================================================
// Namespace Tests
// =============================================================================

Ende.test("parseSync() throws on unbound namespace prefix in element", () => {
  assertThrows(
    () => parseSync("<ns:root/>"),
    XmlSyntaxError,
    "Unbound namespace prefix 'ns'",
  );
});

Ende.test("parseSync() throws on unbound namespace prefix in attribute", () => {
  assertThrows(
    () => parseSync("<root ns:attr='value'/>"),
    XmlSyntaxError,
    "Unbound namespace prefix 'ns'",
  );
});

Ende.test("parseSync() throws on duplicate attribute", () => {
  assertThrows(
    () => parseSync('<root attr="1" attr="2"/>'),
    XmlSyntaxError,
    "Duplicate attribute 'attr'",
  );
});

Ende.test("parseSync() throws on duplicate expanded attribute names", () => {
  assertThrows(
    () =>
      parseSync(
        '<root xmlns:a="http://example.com" xmlns:b="http://example.com" a:attr="1" b:attr="2"/>',
      ),
    XmlSyntaxError,
    "Duplicate expanded attribute name",
  );
});

Ende.test("parseSync() throws on element using xmlns prefix", () => {
  assertThrows(
    () => parseSync('<xmlns:test xmlns:xmlns="http://example.com"/>'),
    XmlSyntaxError,
    "Element name cannot use the 'xmlns' prefix",
  );
});

Ende.test("parseSync() handles namespace scope restoration on element close", () => {
  // Tests that namespace bindings are properly restored when elements close
  const doc = parseSync(`
    <root xmlns:ns="http://outer.com">
      <child xmlns:ns="http://inner.com">
        <ns:inner/>
      </child>
      <ns:outer/>
    </root>
  `);

  // The inner ns:inner element should have inner URI
  const children = doc.root.children.filter((c) => c.type === "element");
  const child = children[0];
  if (child?.type === "element") {
    const innerEl = child.children.find((c) => c.type === "element");
    if (innerEl?.type === "element") {
      assertEquals(innerEl.name.uri, "http://inner.com");
    }
  }

  // The outer ns:outer element should have outer URI
  const outer = children[1];
  if (outer?.type === "element") {
    assertEquals(outer.name.uri, "http://outer.com");
  }
});

// =============================================================================
// QName Validation Tests
// =============================================================================

Ende.test("parseSync() throws on QName starting with colon", () => {
  assertThrows(
    () => parseSync('<:element xmlns=":""/>'),
    XmlSyntaxError,
    "QName cannot start with ':'",
  );
});

Ende.test("parseSync() throws on QName ending with colon", () => {
  assertThrows(
    () => parseSync('<element: xmlns:element="http://example.com"/>'),
    XmlSyntaxError,
    "QName cannot end with ':'",
  );
});

Ende.test("parseSync() throws on QName with multiple colons", () => {
  assertThrows(
    () => parseSync('<a:b:c xmlns:a="http://a.com" xmlns:b="http://b.com"/>'),
    XmlSyntaxError,
    "QName cannot contain multiple ':'",
  );
});

Ende.test("parseSync() throws on attribute QName starting with colon", () => {
  assertThrows(
    () => parseSync('<root :attr="value"/>'),
    XmlSyntaxError,
    "QName cannot start with ':'",
  );
});

// =============================================================================
// Processing Instruction Tests
// =============================================================================

Ende.test("parseSync() throws on PI target containing colon", () => {
  assertThrows(
    () => parseSync("<?ns:target content?><root/>"),
    XmlSyntaxError,
    "Cannot use ':' in processing instruction target",
  );
});

Ende.test("parseSync() throws on XML declaration not at start", () => {
  assertThrows(
    () => parseSync('<!-- comment --><?xml version="1.0"?><root/>'),
    XmlSyntaxError,
    "XML declaration must appear at the start of the document",
  );
});

Ende.test("parseSync() throws on BOM before root element", () => {
  // BOM (U+FEFF) is treated as content before root element which is invalid
  // XML 1.0 §2.8 only allows whitespace, comments, PIs, and DOCTYPE before root
  assertThrows(
    () => parseSync('\uFEFF<?xml version="1.0"?><root/>'),
    XmlSyntaxError,
    "Cannot have content before the root element",
  );
});

// =============================================================================
// Comment Validation Tests
// =============================================================================

Ende.test("parseSync() throws on dash immediately before --> in comment", () => {
  assertThrows(
    () => parseSync("<root><!-- test---></root>"),
    XmlSyntaxError,
    "Cannot use '-' immediately before '-->'",
  );
});

// =============================================================================
// Text Content Validation Tests
// =============================================================================

Ende.test("parseSync() throws on ]]> in text content", () => {
  assertThrows(
    () => parseSync("<root>]]></root>"),
    XmlSyntaxError,
    "Cannot use ']]>' in text content",
  );
});

Ende.test("parseSync() throws on illegal XML character in text", () => {
  assertThrows(
    () => parseSync("<root>\x00</root>"),
    XmlSyntaxError,
    "Illegal XML character U+0000",
  );
});

Ende.test("parseSync() throws on illegal XML character in comment", () => {
  assertThrows(
    () => parseSync("<root><!-- \x01 --></root>"),
    XmlSyntaxError,
    "Illegal XML character U+0001",
  );
});

Ende.test("parseSync() throws on illegal XML character in CDATA", () => {
  assertThrows(
    () => parseSync("<root><![CDATA[\x02]]></root>"),
    XmlSyntaxError,
    "Illegal XML character U+0002",
  );
});

// =============================================================================
// No Root Element Test
// =============================================================================

Ende.test("parseSync() throws on empty document", () => {
  assertThrows(
    () => parseSync(""),
    XmlSyntaxError,
    "No root element found",
  );
});

Ende.test("parseSync() throws on document with only whitespace", () => {
  assertThrows(
    () => parseSync("   \n   "),
    XmlSyntaxError,
    "No root element found",
  );
});

Ende.test("parseSync() throws on document with only declaration", () => {
  assertThrows(
    () => parseSync('<?xml version="1.0"?>'),
    XmlSyntaxError,
    "No root element found",
  );
});

// =============================================================================
// Invalid Character in End Tag Tests
// =============================================================================

Ende.test("parseSync() throws on invalid character in end tag name", () => {
  // The parser reads "r" then hits "@" which terminates the name
  // Then expects '>' but finds 'o'
  assertThrows(
    () => parseSync("<root></r@ot>"),
    XmlSyntaxError,
    "Expected '>' in end tag",
  );
});

// =============================================================================
// Self-closing root element with namespace
// =============================================================================

Ende.test("parseSync() handles self-closing root with namespace bindings", () => {
  const doc = parseSync('<ns:root xmlns:ns="http://example.com"/>');
  assertEquals(doc.root.name.prefix, "ns");
  assertEquals(doc.root.name.uri, "http://example.com");
});

// =============================================================================
// Additional Coverage: DTD Internal Subset Edge Cases
// =============================================================================

Ende.test("parseSync() throws on unexpected end of input in DTD after <", () => {
  assertThrows(
    () => parseSync("<!DOCTYPE root [<", { disallowDoctype: false }),
    XmlSyntaxError,
    "Unexpected end of input in DTD",
  );
});

Ende.test("parseSync() throws on unexpected character after < in DTD internal subset", () => {
  assertThrows(
    () => parseSync("<!DOCTYPE root [<x]><root/>", { disallowDoctype: false }),
    XmlSyntaxError,
    "Unexpected character 'x' after '<' in DTD",
  );
});

Ende.test("parseSync() throws on conditional section [ in internal subset", () => {
  // A bare '[' character (not as part of <![) is not allowed
  assertThrows(
    () => parseSync("<!DOCTYPE root [ [ ]><root/>", { disallowDoctype: false }),
    XmlSyntaxError,
    "Conditional sections (INCLUDE/IGNORE) are not allowed in internal DTD subset",
  );
});

Ende.test("parseSync() throws on unexpected character in DTD internal subset", () => {
  // Characters like '@' are not valid in the internal subset
  assertThrows(
    () => parseSync("<!DOCTYPE root [ @ ]><root/>", { disallowDoctype: false }),
    XmlSyntaxError,
    "Unexpected character '@' in DTD internal subset",
  );
});

Ende.test("parseSync() throws on unterminated DTD internal subset", () => {
  assertThrows(
    () =>
      parseSync("<!DOCTYPE root [ <!ELEMENT root (#PCDATA)>", {
        disallowDoctype: false,
      }),
    XmlSyntaxError,
    "Unterminated DTD internal subset",
  );
});

// =============================================================================
// Additional Coverage: DTD Comment Edge Cases
// =============================================================================

Ende.test("parseSync() throws on single dash starting comment in DTD", () => {
  // <!- is not a valid comment start, must be <!--
  assertThrows(
    () =>
      parseSync("<!DOCTYPE root [<!->]><root/>", { disallowDoctype: false }),
    XmlSyntaxError,
    "Expected '--' to start comment in DTD",
  );
});

Ende.test("parseSync() throws on -- not followed by > in DTD comment", () => {
  assertThrows(
    () =>
      parseSync("<!DOCTYPE root [<!-- comment --x -->]><root/>", {
        disallowDoctype: false,
      }),
    XmlSyntaxError,
    "Cannot use '--' within XML comments",
  );
});

Ende.test("parseSync() throws on unterminated comment in DTD", () => {
  assertThrows(
    () =>
      parseSync("<!DOCTYPE root [<!-- unterminated", {
        disallowDoctype: false,
      }),
    XmlSyntaxError,
    "Unterminated comment in DTD",
  );
});

Ende.test("parseSync() throws on unexpected end in DTD declaration", () => {
  assertThrows(
    () => parseSync("<!DOCTYPE root [<!", { disallowDoctype: false }),
    XmlSyntaxError,
    "Unexpected end of input in DTD declaration",
  );
});

// =============================================================================
// Additional Coverage: DTD Declaration Keyword Validation
// =============================================================================

Ende.test("parseSync() throws on missing whitespace after DTD declaration keyword", () => {
  assertThrows(
    () =>
      parseSync("<!DOCTYPE root [<!ELEMENT>]><root/>", {
        disallowDoctype: false,
      }),
    XmlSyntaxError,
    "Missing whitespace after '<!ELEMENT'",
  );
});

// =============================================================================
// Additional Coverage: ENTITY Declaration Edge Cases
// =============================================================================

Ende.test("parseSync() throws on missing whitespace after % in parameter entity", () => {
  assertThrows(
    () =>
      parseSync("<!DOCTYPE root [<!ENTITY %name 'value'>]><root/>", {
        disallowDoctype: false,
      }),
    XmlSyntaxError,
    "Missing whitespace after '%' in parameter entity declaration",
  );
});

Ende.test("parseSync() throws on missing entity name in ENTITY declaration", () => {
  assertThrows(
    () =>
      parseSync("<!DOCTYPE root [<!ENTITY  'value'>]><root/>", {
        disallowDoctype: false,
      }),
    XmlSyntaxError,
    "Missing entity name in ENTITY declaration",
  );
});

Ende.test("parseSync() throws on missing whitespace after entity name", () => {
  assertThrows(
    () =>
      parseSync("<!DOCTYPE root [<!ENTITY name'value'>]><root/>", {
        disallowDoctype: false,
      }),
    XmlSyntaxError,
    "Missing whitespace after entity name",
  );
});

Ende.test("parseSync() throws on SGML-style comment in entity value", () => {
  assertThrows(
    () =>
      parseSync(
        "<!DOCTYPE root [<!ENTITY name 'value' -- comment -->]><root/>",
        { disallowDoctype: false },
      ),
    XmlSyntaxError,
    "SGML-style comments (--) are not allowed in XML declarations",
  );
});

Ende.test("parseSync() throws on missing whitespace after SYSTEM in ENTITY", () => {
  assertThrows(
    () =>
      parseSync('<!DOCTYPE root [<!ENTITY ext SYSTEM"file.xml">]><root/>', {
        disallowDoctype: false,
      }),
    XmlSyntaxError,
    "Missing whitespace after SYSTEM keyword",
  );
});

Ende.test("parseSync() throws on missing whitespace after PUBLIC in ENTITY", () => {
  assertThrows(
    () =>
      parseSync(
        '<!DOCTYPE root [<!ENTITY ext PUBLIC"-//Test//EN" "file.xml">]><root/>',
        { disallowDoctype: false },
      ),
    XmlSyntaxError,
    "Missing whitespace after PUBLIC keyword",
  );
});

Ende.test("parseSync() throws on PUBLIC missing system literal in ENTITY", () => {
  assertThrows(
    () =>
      parseSync(
        '<!DOCTYPE root [<!ENTITY ext PUBLIC "-//Test//EN">]><root/>',
        { disallowDoctype: false },
      ),
    XmlSyntaxError,
    "PUBLIC identifier requires both public ID and system ID literals",
  );
});

Ende.test("parseSync() throws on PUBLIC with non-quoted system literal", () => {
  assertThrows(
    () =>
      parseSync(
        '<!DOCTYPE root [<!ENTITY ext PUBLIC "-//Test//EN" file.xml>]><root/>',
        { disallowDoctype: false },
      ),
    XmlSyntaxError,
    "PUBLIC identifier requires both public ID and system ID literals",
  );
});

Ende.test("parseSync() throws on invalid keyword in ENTITY declaration", () => {
  assertThrows(
    () =>
      parseSync(
        '<!DOCTYPE root [<!ENTITY ext INVALID "file.xml">]><root/>',
        { disallowDoctype: false },
      ),
    XmlSyntaxError,
    "Expected SYSTEM, PUBLIC, or quoted string in ENTITY declaration",
  );
});

Ende.test("parseSync() throws on missing whitespace after NDATA keyword", () => {
  assertThrows(
    () =>
      parseSync(
        '<!DOCTYPE root [<!ENTITY logo SYSTEM "logo.png" NDATApng>]><root/>',
        { disallowDoctype: false },
      ),
    XmlSyntaxError,
    "Missing whitespace after NDATA keyword",
  );
});

Ende.test("parseSync() throws on missing notation name after NDATA", () => {
  assertThrows(
    () =>
      parseSync(
        '<!DOCTYPE root [<!ENTITY logo SYSTEM "logo.png" NDATA >]><root/>',
        { disallowDoctype: false },
      ),
    XmlSyntaxError,
    "Missing notation name after NDATA",
  );
});

Ende.test("parseSync() throws on unexpected content in ENTITY declaration", () => {
  assertThrows(
    () =>
      parseSync(
        '<!DOCTYPE root [<!ENTITY ext SYSTEM "file.xml" @>]><root/>',
        { disallowDoctype: false },
      ),
    XmlSyntaxError,
    "Unexpected content '@' in ENTITY declaration",
  );
});

Ende.test("parseSync() throws on unterminated ENTITY declaration", () => {
  assertThrows(
    () =>
      parseSync('<!DOCTYPE root [<!ENTITY name "value"', {
        disallowDoctype: false,
      }),
    XmlSyntaxError,
    "Unterminated ENTITY declaration",
  );
});

Ende.test("parseSync() throws on unterminated quoted string in ENTITY", () => {
  assertThrows(
    () =>
      parseSync('<!DOCTYPE root [<!ENTITY name "unterminated', {
        disallowDoctype: false,
      }),
    XmlSyntaxError,
    "Unterminated quoted string",
  );
});

// =============================================================================
// Additional Coverage: PubidLiteral Validation
// =============================================================================

Ende.test("parseSync() throws on invalid character in public ID literal", () => {
  // Control characters are not valid in PubidLiteral
  assertThrows(
    () =>
      parseSync(
        '<!DOCTYPE root [<!ENTITY ext PUBLIC "test\x7Fvalue" "file.xml">]><root/>',
        { disallowDoctype: false },
      ),
    XmlSyntaxError,
    "Invalid character",
  );
});

Ende.test("parseSync() throws on single quote in single-quoted public ID", () => {
  // Single quote inside single-quoted PubidLiteral is invalid
  assertThrows(
    () =>
      parseSync(
        "<!DOCTYPE root [<!ENTITY ext PUBLIC 'test'quote' \"file.xml\">]><root/>",
        { disallowDoctype: false },
      ),
    XmlSyntaxError,
  );
});

// =============================================================================
// Additional Coverage: DOCTYPE External ID Edge Cases
// =============================================================================

Ende.test("parseSync() throws on missing whitespace after DOCTYPE", () => {
  assertThrows(
    () => parseSync("<!DOCTYPEroot><root/>", { disallowDoctype: false }),
    XmlSyntaxError,
    "Expected whitespace after DOCTYPE",
  );
});

Ende.test("parseSync() throws on missing name in DOCTYPE", () => {
  assertThrows(
    () => parseSync("<!DOCTYPE ><root/>", { disallowDoctype: false }),
    XmlSyntaxError,
    "Missing name in DOCTYPE declaration",
  );
});

Ende.test("parseSync() handles DOCTYPE with SYSTEM external ID", () => {
  const doc = parseSync('<!DOCTYPE root SYSTEM "root.dtd"><root/>', {
    disallowDoctype: false,
  });
  assertEquals(doc.root.name.local, "root");
});

Ende.test("parseSync() handles DOCTYPE with PUBLIC external ID", () => {
  const doc = parseSync(
    '<!DOCTYPE root PUBLIC "-//Test//DTD Test//EN" "test.dtd"><root/>',
    { disallowDoctype: false },
  );
  assertEquals(doc.root.name.local, "root");
});

Ende.test("parseSync() throws on quoted string in DOCTYPE without SYSTEM/PUBLIC", () => {
  assertThrows(
    () =>
      parseSync('<!DOCTYPE root "unexpected.dtd"><root/>', {
        disallowDoctype: false,
      }),
    XmlSyntaxError,
    "Unexpected quoted string in DOCTYPE - expected PUBLIC or SYSTEM",
  );
});

Ende.test("parseSync() throws on unterminated quoted string in DOCTYPE", () => {
  assertThrows(
    () =>
      parseSync('<!DOCTYPE root SYSTEM "unterminated', {
        disallowDoctype: false,
      }),
    XmlSyntaxError,
    "Unterminated quoted string in DOCTYPE",
  );
});

Ende.test("parseSync() throws on lowercase public in DOCTYPE", () => {
  assertThrows(
    () =>
      parseSync('<!DOCTYPE root public "-//Test//EN" "test.dtd"><root/>', {
        disallowDoctype: false,
      }),
    XmlSyntaxError,
    "must be uppercase 'PUBLIC'",
  );
});

Ende.test("parseSync() throws on lowercase system in DOCTYPE", () => {
  assertThrows(
    () =>
      parseSync('<!DOCTYPE root system "test.dtd"><root/>', {
        disallowDoctype: false,
      }),
    XmlSyntaxError,
    "must be uppercase 'SYSTEM'",
  );
});

// =============================================================================
// Additional Coverage: Processing Instruction Edge Cases
// =============================================================================

Ende.test("parseSync() throws on empty PI target", () => {
  assertThrows(
    () => parseSync("<? content?><root/>"),
    XmlSyntaxError,
    "Invalid character in processing instruction target",
  );
});

Ende.test("parseSync() throws on invalid character after PI target", () => {
  // The '+' is not a valid NameChar, so target ends, then '+' is unexpected
  assertThrows(
    () => parseSync("<?target+ content?><root/>"),
    XmlSyntaxError,
    "Unexpected character '+' in processing instruction target",
  );
});

Ende.test("parseSync() throws on illegal XML character in PI content", () => {
  assertThrows(
    () => parseSync("<?target \x00?><root/>"),
    XmlSyntaxError,
    "Illegal XML character U+0000 in processing instruction",
  );
});

Ende.test("parseSync() throws on reserved PI target XML (uppercase)", () => {
  assertThrows(
    () => parseSync("<?XML version='1.0'?><root/>"),
    XmlSyntaxError,
    "Processing instruction target 'XML' is reserved",
  );
});

Ende.test("parseSync() throws on reserved PI target Xml (mixed case)", () => {
  assertThrows(
    () => parseSync("<?Xml version='1.0'?><root/>"),
    XmlSyntaxError,
    "Processing instruction target 'Xml' is reserved",
  );
});

Ende.test("parseSync() throws on invalid XML declaration", () => {
  assertThrows(
    () => parseSync("<?xml invalid?><root/>"),
    XmlSyntaxError,
  );
});

// =============================================================================
// Additional Coverage: Attribute and Element Edge Cases
// =============================================================================

Ende.test("parseSync() throws on missing whitespace between attributes", () => {
  assertThrows(
    () => parseSync('<root attr1="1"attr2="2"/>'),
    XmlSyntaxError,
    "Missing whitespace between attributes",
  );
});

Ende.test("parseSync() throws on invalid character in end tag name", () => {
  // Empty name case - starts with invalid char
  assertThrows(
    () => parseSync("<root></@>"),
    XmlSyntaxError,
    "Invalid character in end tag name",
  );
});

// =============================================================================
// Additional Coverage: Namespace Binding Validation
// =============================================================================

Ende.test("parseSync() throws on invalid namespace binding", () => {
  // Empty namespace URI for non-default namespace is invalid
  assertThrows(
    () => parseSync('<root xmlns:ns=""/>'),
    XmlSyntaxError,
  );
});

Ende.test("parseSync() handles element with default xmlns namespace", () => {
  // Default xmlns should be skipped in namespace processing
  const doc = parseSync('<root xmlns="http://default.com"><child/></root>');
  assertEquals(doc.root.name.uri, undefined); // Default NS doesn't set URI on non-prefixed elements in this impl
});

// =============================================================================
// Additional Coverage: xml Prefix Element URI
// =============================================================================

Ende.test("parseSync() resolves xml prefix on element to XML namespace", () => {
  // The xml: prefix is always bound to the XML namespace
  // While unusual, xml:element should work
  const doc = parseSync(
    '<xml:root xmlns:xml="http://www.w3.org/XML/1998/namespace"/>',
  );
  assertEquals(doc.root.name.prefix, "xml");
  assertEquals(doc.root.name.uri, "http://www.w3.org/XML/1998/namespace");
});

// =============================================================================
// Additional Coverage: Namespace Scope Restoration with Previous URI
// =============================================================================

Ende.test("parseSync() restores previous namespace URI on element close", () => {
  // Tests the branch where previousUri is not undefined
  const doc = parseSync(`
    <root xmlns:ns="http://first.com">
      <middle xmlns:ns="http://second.com">
        <inner xmlns:ns="http://third.com">
          <ns:elem1/>
        </inner>
        <ns:elem2/>
      </middle>
      <ns:elem3/>
    </root>
  `);

  // Find the ns:elem elements and check their URIs
  function findElement(
    children: readonly import("./types.ts").XmlNode[],
    name: string,
  ): import("./types.ts").XmlElement | undefined {
    for (const child of children) {
      if (child.type === "element") {
        if (child.name.local === name) return child;
        const found = findElement(child.children, name);
        if (found) return found;
      }
    }
    return undefined;
  }

  const elem1 = findElement(doc.root.children, "elem1");
  const elem2 = findElement(doc.root.children, "elem2");
  const elem3 = findElement(doc.root.children, "elem3");

  assertEquals(elem1?.name.uri, "http://third.com");
  assertEquals(elem2?.name.uri, "http://second.com");
  assertEquals(elem3?.name.uri, "http://first.com");
});

// =============================================================================
// Additional Coverage: Self-closing Element Namespace Restoration
// =============================================================================

Ende.test("parseSync() restores namespace for self-closing element with redefinition", () => {
  // Tests the branch in self-closing element namespace restoration where previousUri exists
  const doc = parseSync(`
    <root xmlns:ns="http://outer.com">
      <ns:child xmlns:ns="http://inner.com"/>
      <ns:sibling/>
    </root>
  `);

  const children = doc.root.children.filter((c) => c.type === "element");
  const child = children[0];
  const sibling = children[1];

  if (child?.type === "element" && sibling?.type === "element") {
    assertEquals(child.name.uri, "http://inner.com");
    assertEquals(sibling.name.uri, "http://outer.com");
  }
});

// =============================================================================
// Additional Coverage: Parameter Entity Reference in DTD
// =============================================================================

Ende.test("parseSync() handles parameter entity reference with extended chars", () => {
  // Tests the name character loop in parameter entity parsing
  const doc = parseSync(
    `<!DOCTYPE root [
    %entity_name.test-123;
  ]><root/>`,
    { disallowDoctype: false },
  );
  assertEquals(doc.root.name.local, "root");
});

Ende.test("parseSync() throws on invalid character in parameter entity reference", () => {
  assertThrows(
    () =>
      parseSync("<!DOCTYPE root [%entity@name;]><root/>", {
        disallowDoctype: false,
      }),
    XmlSyntaxError,
    "Invalid character in parameter entity reference",
  );
});

// =============================================================================
// Additional Coverage: ignoreWhitespace Option
// =============================================================================

Ende.test("parseSync() ignores whitespace-only text nodes when ignoreWhitespace is true", () => {
  const doc = parseSync("<root>   \n   </root>", { ignoreWhitespace: true });
  // With ignoreWhitespace, whitespace-only text should not create nodes
  assertEquals(doc.root.children.length, 0);
});

Ende.test("parseSync() preserves non-whitespace text when ignoreWhitespace is true", () => {
  const doc = parseSync("<root>  text  </root>", { ignoreWhitespace: true });
  assertEquals(doc.root.children.length, 1);
  if (doc.root.children[0]?.type === "text") {
    assertEquals(doc.root.children[0].text, "  text  ");
  }
});

// =============================================================================
// Resource Exhaustion Limits: maxDepth / maxAttributes
// =============================================================================

Ende.test("parseSync() throws when element nesting exceeds maxDepth", () => {
  assertThrows(
    () => parseSync("<a><b><c></c></b></a>", { maxDepth: 2 }),
    XmlSyntaxError,
    "Element nesting depth exceeds limit of 2",
  );
});

Ende.test("parseSync() allows nesting within maxDepth", () => {
  const doc = parseSync("<a><b><c/></b></a>", { maxDepth: 3 });
  assertEquals(doc.root.name.local, "a");
});

Ende.test("parseSync() throws when attributes exceed maxAttributes", () => {
  assertThrows(
    () => parseSync('<root a="1" b="2" c="3"/>', { maxAttributes: 2 }),
    XmlSyntaxError,
    "Attribute count exceeds limit of 2",
  );
});

Ende.test("parseSync() allows attributes within maxAttributes", () => {
  const doc = parseSync('<root a="1" b="2"/>', { maxAttributes: 2 });
  assertEquals(doc.root.name.local, "root");
});

// =============================================================================
// Non-ASCII (Unicode) element and attribute names
// =============================================================================

Ende.test("parseSync() handles non-ASCII BMP element name", () => {
  const doc = parseSync("<café/>");
  assertEquals(doc.root.name.local, "café");
});

// =============================================================================
// Namespace expanded-name: same local name, different URIs
// =============================================================================

Ende.test("parseSync() allows same local name with different namespace URIs", () => {
  const doc = parseSync(
    '<root xmlns:a="http://a.com" xmlns:b="http://b.com" a:x="1" b:x="2"/>',
  );
  const attrs = Object.keys(doc.root.attributes);
  assertEquals(attrs.includes("a:x"), true);
  assertEquals(attrs.includes("b:x"), true);
});

// =============================================================================
// XML 1.1 Character Validation Tests
// =============================================================================

Ende.test("parseSync() xml11 rejects literal C0 control in text", () => {
  assertThrows(
    () => parseSync("<root>\x01</root>", { xmlVersion: "1.1" }),
    XmlSyntaxError,
    "Illegal XML character",
  );
});

Ende.test("parseSync() xml11 rejects literal C1 control in text", () => {
  assertThrows(
    () => parseSync("<root>\x80</root>", { xmlVersion: "1.1" }),
    XmlSyntaxError,
    "Illegal XML character",
  );
  assertThrows(
    () => parseSync("<root>\x9F</root>", { xmlVersion: "1.1" }),
    XmlSyntaxError,
    "Illegal XML character",
  );
});

Ende.test("parseSync() xml11 rejects NULL in text", () => {
  assertThrows(
    () => parseSync("<root>\x00</root>", { xmlVersion: "1.1" }),
    XmlSyntaxError,
    "Illegal XML character",
  );
});

Ende.test("parseSync() xml11 allows NEL after line-ending normalization", () => {
  const doc = parseSync("<root>a\x85b</root>", { xmlVersion: "1.1" });
  assertEquals(doc.root.children.length, 1);
});

Ende.test("parseSync() xml11 rejects literal C0 control in comment", () => {
  assertThrows(
    () => parseSync("<root><!--\x01--></root>", { xmlVersion: "1.1" }),
    XmlSyntaxError,
    "Illegal XML character",
  );
});

Ende.test("parseSync() xml11 rejects literal C1 control in CDATA", () => {
  assertThrows(
    () =>
      parseSync(
        "<root><![CDATA[\x80]]></root>",
        { disallowDoctype: false, xmlVersion: "1.1" },
      ),
    XmlSyntaxError,
    "Illegal XML character",
  );
});

Ende.test("parseSync() xml11 rejects literal C0 control in PI content", () => {
  assertThrows(
    () => parseSync("<root><?pi \x02?></root>", { xmlVersion: "1.1" }),
    XmlSyntaxError,
    "Illegal XML character",
  );
});

Ende.test("parseSync() xml11 rejects noncharacter U+FFFE", () => {
  assertThrows(
    () => parseSync("<root>\uFFFE</root>", { xmlVersion: "1.1" }),
    XmlSyntaxError,
    "Illegal XML character",
  );
});

Ende.test("parseSync() xml11 rejects noncharacter U+FFFF", () => {
  assertThrows(
    () => parseSync("<root>\uFFFF</root>", { xmlVersion: "1.1" }),
    XmlSyntaxError,
    "Illegal XML character",
  );
});

Ende.test("parseSync() xml11 allows C0 control via character reference", () => {
  const doc = parseSync("<root>&#x1;</root>", { xmlVersion: "1.1" });
  const child = doc.root.children[0];
  assertEquals(child?.type, "text");
  if (child?.type === "text") {
    assertEquals(child.text, "\x01");
  }
});

Ende.test("parseSync() xml11 allows C1 control via character reference", () => {
  const doc = parseSync("<root>&#x85;</root>", { xmlVersion: "1.1" });
  const child = doc.root.children[0];
  assertEquals(child?.type, "text");
  if (child?.type === "text") {
    assertEquals(child.text, "\x85");
  }
});

Ende.test("parseSync() xml11 normalizes NEL and LS line endings", () => {
  const doc = parseSync(
    "<root>a\x85b\u2028c</root>",
    { xmlVersion: "1.1" },
  );
  const child = doc.root.children[0];
  assertEquals(child?.type, "text");
  if (child?.type === "text") {
    assertEquals(child.text, "a\nb\nc");
  }
});
