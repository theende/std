// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.

import { assertEquals } from "@ende/assert/equals";
import { promptSelect } from "./unstable_prompt_select.ts";
import { restore, stub } from "@ende/testing/mock";

const encoder = new TextEncoder();
const decoder = new TextDecoder();
Ende.test("promptSelect() handles CR", () => {
  stub(Ende.stdin, "setRaw");
  stub(Ende.stdin, "isTerminal", () => true);
  stub(Ende, "consoleSize", () => ({ columns: 80, rows: 24 }));

  const expectedOutput = [
    "\x1b[?25l",
    "Please select a browser:\r\n",
    "❯ safari\r\n",
    "  chrome\r\n",
    "  firefox\r\n",
    "\x1b[?25h"
  ];

  const actualOutput: string[] = [];

  stub(
    Ende.stdout,
    "writeSync",
    (data: Uint8Array) => {
      const output = decoder.decode(data);
      actualOutput.push(output);
      return data.length;
    }
  );

  let readIndex = 0;

  const inputs = [
    "\r"
  ];

  stub(
    Ende.stdin,
    "readSync",
    (data: Uint8Array) => {
      const input = inputs[readIndex++];
      const bytes = encoder.encode(input);
      data.set(bytes);
      return bytes.length;
    }
  );

  const browser = promptSelect("Please select a browser:", [
    { label: "safari", value: 1 },
    { label: "chrome", value: 2 },
    { label: "firefox", value: 3 }
  ]);

  assertEquals(browser, { label: "safari", value: 1 });
  assertEquals(expectedOutput, actualOutput);
  restore();
});

Ende.test("promptSelect() handles arrow down", () => {
  stub(Ende.stdin, "setRaw");
  stub(Ende.stdin, "isTerminal", () => true);
  stub(Ende, "consoleSize", () => ({ columns: 80, rows: 24 }));

  const expectedOutput = [
    "\x1b[?25l",
    "Please select a browser:\r\n",
    "❯ safari\r\n",
    "  chrome\r\n",
    "  firefox\r\n",
    "\x1b[4A",
    "\x1b[J",
    "Please select a browser:\r\n",
    "  safari\r\n",
    "❯ chrome\r\n",
    "  firefox\r\n",
    "\x1b[4A",
    "\x1b[J",
    "Please select a browser:\r\n",
    "  safari\r\n",
    "  chrome\r\n",
    "❯ firefox\r\n",
    "\x1b[?25h"
  ];

  const actualOutput: string[] = [];

  stub(
    Ende.stdout,
    "writeSync",
    (data: Uint8Array) => {
      const output = decoder.decode(data);
      actualOutput.push(output);
      return data.length;
    }
  );

  let readIndex = 0;

  const inputs = [
    "\u001B[B",
    "\u001B[B",
    "\r"
  ];

  stub(
    Ende.stdin,
    "readSync",
    (data: Uint8Array) => {
      const input = inputs[readIndex++];
      const bytes = encoder.encode(input);
      data.set(bytes);
      return bytes.length;
    }
  );

  const browser = promptSelect("Please select a browser:", [
    "safari",
    "chrome",
    "firefox"
  ]);

  assertEquals(browser, "firefox");
  assertEquals(expectedOutput, actualOutput);
  restore();
});

Ende.test("promptSelect() handles arrow up", () => {
  stub(Ende.stdin, "setRaw");
  stub(Ende.stdin, "isTerminal", () => true);
  stub(Ende, "consoleSize", () => ({ columns: 80, rows: 24 }));

  const expectedOutput = [
    "\x1b[?25l",
    "Please select a browser:\r\n",
    "❯ safari\r\n",
    "  chrome\r\n",
    "  firefox\r\n",
    "\x1b[4A",
    "\x1b[J",
    "Please select a browser:\r\n",
    "  safari\r\n",
    "❯ chrome\r\n",
    "  firefox\r\n",
    "\x1b[4A",
    "\x1b[J",
    "Please select a browser:\r\n",
    "❯ safari\r\n",
    "  chrome\r\n",
    "  firefox\r\n",
    "\x1b[?25h"
  ];

  const actualOutput: string[] = [];

  stub(
    Ende.stdout,
    "writeSync",
    (data: Uint8Array) => {
      const output = decoder.decode(data);
      actualOutput.push(output);
      return data.length;
    }
  );

  let readIndex = 0;

  const inputs = [
    "\u001B[B",
    "\u001B[A",
    "\r"
  ];

  stub(
    Ende.stdin,
    "readSync",
    (data: Uint8Array) => {
      const input = inputs[readIndex++];
      const bytes = encoder.encode(input);
      data.set(bytes);
      return bytes.length;
    }
  );

  const browser = promptSelect("Please select a browser:", [
    "safari",
    "chrome",
    "firefox"
  ]);

  assertEquals(browser, "safari");
  assertEquals(expectedOutput, actualOutput);
  restore();
});

Ende.test("promptSelect() handles index underflow", () => {
  stub(Ende.stdin, "setRaw");
  stub(Ende.stdin, "isTerminal", () => true);
  stub(Ende, "consoleSize", () => ({ columns: 80, rows: 24 }));

  const expectedOutput = [
    "\x1b[?25l",
    "Please select a browser:\r\n",
    "❯ safari\r\n",
    "  chrome\r\n",
    "  firefox\r\n",
    "\x1b[4A",
    "\x1b[J",
    "Please select a browser:\r\n",
    "  safari\r\n",
    "  chrome\r\n",
    "❯ firefox\r\n",
    "\x1b[?25h"
  ];

  const actualOutput: string[] = [];

  stub(
    Ende.stdout,
    "writeSync",
    (data: Uint8Array) => {
      const output = decoder.decode(data);
      actualOutput.push(output);
      return data.length;
    }
  );

  let readIndex = 0;

  const inputs = [
    "\u001B[A",
    "\r"
  ];

  stub(
    Ende.stdin,
    "readSync",
    (data: Uint8Array) => {
      const input = inputs[readIndex++];
      const bytes = encoder.encode(input);
      data.set(bytes);
      return bytes.length;
    }
  );

  const browser = promptSelect("Please select a browser:", [
    "safari",
    "chrome",
    "firefox"
  ]);

  assertEquals(browser, "firefox");
  assertEquals(expectedOutput, actualOutput);
  restore();
});

Ende.test("promptSelect() handles index overflow", () => {
  stub(Ende.stdin, "setRaw");
  stub(Ende.stdin, "isTerminal", () => true);
  stub(Ende, "consoleSize", () => ({ columns: 80, rows: 24 }));

  const expectedOutput = [
    "\x1b[?25l",
    "Please select a browser:\r\n",
    "❯ safari\r\n",
    "  chrome\r\n",
    "  firefox\r\n",
    "\x1b[4A",
    "\x1b[J",
    "Please select a browser:\r\n",
    "  safari\r\n",
    "❯ chrome\r\n",
    "  firefox\r\n",
    "\x1b[4A",
    "\x1b[J",
    "Please select a browser:\r\n",
    "  safari\r\n",
    "  chrome\r\n",
    "❯ firefox\r\n",
    "\x1b[4A",
    "\x1b[J",
    "Please select a browser:\r\n",
    "❯ safari\r\n",
    "  chrome\r\n",
    "  firefox\r\n",
    "\x1b[?25h"
  ];

  const actualOutput: string[] = [];

  stub(
    Ende.stdout,
    "writeSync",
    (data: Uint8Array) => {
      const output = decoder.decode(data);
      actualOutput.push(output);
      return data.length;
    }
  );

  let readIndex = 0;

  const inputs = [
    "\u001B[B",
    "\u001B[B",
    "\u001B[B",
    "\r"
  ];

  stub(
    Ende.stdin,
    "readSync",
    (data: Uint8Array) => {
      const input = inputs[readIndex++];
      const bytes = encoder.encode(input);
      data.set(bytes);
      return bytes.length;
    }
  );

  const browser = promptSelect("Please select a browser:", [
    "safari",
    "chrome",
    "firefox"
  ]);

  assertEquals(browser, "safari");
  assertEquals(expectedOutput, actualOutput);
  restore();
});

Ende.test("promptSelect() scrolls down and display lines correctly", () => {
  stub(Ende.stdin, "setRaw");
  stub(Ende.stdin, "isTerminal", () => true);
  stub(Ende, "consoleSize", () => ({ columns: 80, rows: 24 }));

  const expectedOutput = [
    "\x1b[?25l",
    "Please select a browser:\r\n",
    "❯ safari\r\n",
    "  chrome\r\n",
    "  firefox\r\n",
    "  ...\r\n",
    "\x1b[5A",
    "\x1b[J",
    "Please select a browser:\r\n",
    "  safari\r\n",
    "❯ chrome\r\n",
    "  firefox\r\n",
    "  ...\r\n",
    "\x1b[5A",
    "\x1b[J",
    "Please select a browser:\r\n",
    "  safari\r\n",
    "  chrome\r\n",
    "❯ firefox\r\n",
    "  ...\r\n",
    "\x1b[5A",
    "\x1b[J",
    "Please select a browser:\r\n",
    "  ...\r\n",
    "  chrome\r\n",
    "  firefox\r\n",
    "❯ brave\r\n",
    "\x1b[5A",
    "\x1b[J",
    "Please select a browser:\r\n",
    "❯ safari\r\n",
    "  chrome\r\n",
    "  firefox\r\n",
    "  ...\r\n",
    "\x1b[?25h"
  ];

  const actualOutput: string[] = [];

  stub(
    Ende.stdout,
    "writeSync",
    (data: Uint8Array) => {
      const output = decoder.decode(data);
      actualOutput.push(output);
      return data.length;
    }
  );

  let readIndex = 0;

  const inputs = [
    "\u001B[B",
    "\u001B[B",
    "\u001B[B",
    "\u001B[B",
    "\r"
  ];

  stub(
    Ende.stdin,
    "readSync",
    (data: Uint8Array) => {
      const input = inputs[readIndex++];
      const bytes = encoder.encode(input);
      data.set(bytes);
      return bytes.length;
    }
  );

  const browser = promptSelect("Please select a browser:", [
    "safari",
    "chrome",
    "firefox",
    "brave"
  ], { visibleLines: 3 });

  assertEquals(browser, "safari");
  assertEquals(expectedOutput, actualOutput);
  restore();
});

Ende.test("promptSelect() uses Ende.consoleSize().rows", () => {
  stub(Ende.stdin, "setRaw");
  stub(Ende.stdin, "isTerminal", () => true);
  stub(Ende, "consoleSize", () => ({ columns: 80, rows: 24 }));

  const expectedOutput = [
    "\x1b[?25l",
    "Please select a Country:\r\n",
    "❯ Brazil\r\n",
    "  Spain\r\n",
    "  Japan\r\n",
    "  USA\r\n",
    "  Mexico\r\n",
    "  Canada\r\n",
    "  Portugal\r\n",
    "  India\r\n",
    "\x1b[9A",
    "\x1b[J",
    "Please select a Country:\r\n",
    "  Brazil\r\n",
    "❯ Spain\r\n",
    "  Japan\r\n",
    "  USA\r\n",
    "  Mexico\r\n",
    "  Canada\r\n",
    "  Portugal\r\n",
    "  India\r\n",
    "\x1b[9A",
    "\x1b[J",
    "Please select a Country:\r\n",
    "  Brazil\r\n",
    "  Spain\r\n",
    "❯ Japan\r\n",
    "  USA\r\n",
    "  Mexico\r\n",
    "  Canada\r\n",
    "  Portugal\r\n",
    "  India\r\n",
    "\x1b[9A",
    "\x1b[J",
    "Please select a Country:\r\n",
    "  Brazil\r\n",
    "  Spain\r\n",
    "  Japan\r\n",
    "❯ USA\r\n",
    "  Mexico\r\n",
    "  Canada\r\n",
    "  Portugal\r\n",
    "  India\r\n",
    "\x1b[?25h"
  ];

  const actualOutput: string[] = [];

  stub(
    Ende.stdout,
    "writeSync",
    (data: Uint8Array) => {
      const output = decoder.decode(data);
      actualOutput.push(output);
      return data.length;
    }
  );

  let readIndex = 0;

  const inputs = [
    "\u001B[B",
    "\u001B[B",
    "\u001B[B",
    "\r"
  ];

  stub(
    Ende.stdin,
    "readSync",
    (data: Uint8Array) => {
      const input = inputs[readIndex++];
      const bytes = encoder.encode(input);
      data.set(bytes);
      return bytes.length;
    }
  );

  const browser = promptSelect("Please select a Country:", [
    "Brazil",
    "Spain",
    "Japan",
    "USA",
    "Mexico",
    "Canada",
    "Portugal",
    "India"
  ]);

  assertEquals(browser, "USA");
  assertEquals(expectedOutput, actualOutput);
  restore();
});

Ende.test("promptSelect() display certain number of visibleLines", () => {
  stub(Ende.stdin, "setRaw");
  stub(Ende.stdin, "isTerminal", () => true);
  stub(Ende, "consoleSize", () => ({ columns: 80, rows: 24 }));

  const expectedOutput = [
    "\x1b[?25l",
    "Please select a browser:\r\n",
    "❯ safari\r\n",
    "  chrome\r\n",
    "  ...\r\n",
    "\x1b[4A",
    "\x1b[J",
    "Please select a browser:\r\n",
    "  safari\r\n",
    "❯ chrome\r\n",
    "  ...\r\n",
    "\x1b[4A",
    "\x1b[J",
    "Please select a browser:\r\n",
    "  ...\r\n",
    "  chrome\r\n",
    "❯ firefox\r\n",
    "  ...\r\n",
    "\x1b[5A",
    "\x1b[J",
    "Please select a browser:\r\n",
    "  ...\r\n",
    "  firefox\r\n",
    "❯ brave\r\n",
    "\x1b[4A",
    "\x1b[J",
    "Please select a browser:\r\n",
    "❯ safari\r\n",
    "  chrome\r\n",
    "  ...\r\n",
    "\x1b[?25h"
  ];

  const actualOutput: string[] = [];

  stub(
    Ende.stdout,
    "writeSync",
    (data: Uint8Array) => {
      const output = decoder.decode(data);
      actualOutput.push(output);
      return data.length;
    }
  );

  let readIndex = 0;

  const inputs = [
    "\u001B[B",
    "\u001B[B",
    "\u001B[B",
    "\u001B[B",
    "\r"
  ];

  stub(
    Ende.stdin,
    "readSync",
    (data: Uint8Array) => {
      const input = inputs[readIndex++];
      const bytes = encoder.encode(input);
      data.set(bytes);
      return bytes.length;
    }
  );

  const browser = promptSelect("Please select a browser:", [
    "safari",
    "chrome",
    "firefox",
    "brave"
  ], { visibleLines: 2 });

  assertEquals(browser, "safari");
  assertEquals(expectedOutput, actualOutput);
  restore();
});

Ende.test("promptSelect() changes the indicator", () => {
  stub(Ende.stdin, "setRaw");
  stub(Ende.stdin, "isTerminal", () => true);
  stub(Ende, "consoleSize", () => ({ columns: 80, rows: 24 }));

  const expectedOutput = [
    "\x1b[?25l",
    "Please select a browser:\r\n",
    "-> safari\r\n",
    "   chrome\r\n",
    "   firefox\r\n",
    "\x1b[4A",
    "\x1b[J",
    "Please select a browser:\r\n",
    "   safari\r\n",
    "-> chrome\r\n",
    "   firefox\r\n",
    "\x1b[4A",
    "\x1b[J",
    "Please select a browser:\r\n",
    "   safari\r\n",
    "   chrome\r\n",
    "-> firefox\r\n",
    "\x1b[?25h"
  ];

  const actualOutput: string[] = [];

  stub(
    Ende.stdout,
    "writeSync",
    (data: Uint8Array) => {
      const output = decoder.decode(data);
      actualOutput.push(output);
      return data.length;
    }
  );

  let readIndex = 0;

  const inputs = [
    "\u001B[B",
    "\u001B[B",
    "\r"
  ];

  stub(
    Ende.stdin,
    "readSync",
    (data: Uint8Array) => {
      const input = inputs[readIndex++];
      const bytes = encoder.encode(input);
      data.set(bytes);
      return bytes.length;
    }
  );

  const browser = promptSelect("Please select a browser:", [
    "safari",
    "chrome",
    "firefox"
  ], { indicator: "->" });

  assertEquals(browser, "firefox");
  assertEquals(expectedOutput, actualOutput);
  restore();
});
Ende.test("promptSelect() handles clear option", () => {
  stub(Ende.stdin, "setRaw");
  stub(Ende.stdin, "isTerminal", () => true);
  stub(Ende, "consoleSize", () => ({ columns: 80, rows: 24 }));

  const expectedOutput = [
    "\x1b[?25l",
    "Please select a browser:\r\n",
    "❯ safari\r\n",
    "  chrome\r\n",
    "  firefox\r\n",
    "\x1b[4A",
    "\x1b[J",
    "\x1b[?25h"
  ];

  const actualOutput: string[] = [];

  stub(
    Ende.stdout,
    "writeSync",
    (data: Uint8Array) => {
      const output = decoder.decode(data);
      actualOutput.push(output);
      return data.length;
    }
  );

  let readIndex = 0;

  const inputs = [
    "\r"
  ];

  stub(
    Ende.stdin,
    "readSync",
    (data: Uint8Array) => {
      const input = inputs[readIndex++];
      const bytes = encoder.encode(input);
      data.set(bytes);
      return bytes.length;
    }
  );

  const browser = promptSelect("Please select a browser:", [
    "safari",
    "chrome",
    "firefox"
  ], { clear: true });

  assertEquals(browser, "safari");
  assertEquals(expectedOutput, actualOutput);
  restore();
});

Ende.test("promptSelect() returns null if Ende.stdin.isTerminal() is false", () => {
  stub(Ende.stdin, "setRaw");
  stub(Ende.stdin, "isTerminal", () => false);
  stub(Ende, "consoleSize", () => ({ columns: 80, rows: 24 }));

  const expectedOutput: string[] = [];

  const actualOutput: string[] = [];

  stub(
    Ende.stdout,
    "writeSync",
    (data: Uint8Array) => {
      const output = decoder.decode(data);
      actualOutput.push(output);
      return data.length;
    }
  );

  const browser = promptSelect("Please select a browser:", [
    "safari",
    "chrome",
    "firefox"
  ]);

  assertEquals(browser, null);
  assertEquals(expectedOutput, actualOutput);
  restore();
});

Ende.test("promptSelect() handles search", () => {
  stub(Ende.stdin, "setRaw");
  stub(Ende.stdin, "isTerminal", () => true);
  stub(Ende, "consoleSize", () => ({ columns: 80, rows: 24 }));

  const expectedOutput = [
    "\x1b[?25l",
    "Please select a browser:\r\n",
    "❯ safari\r\n",
    "  chrome\r\n",
    "  firefox\r\n",
    "\x1b[4A",
    "\x1b[J",
    "Please select a browser: (filter: c)\r\n",
    "❯ chrome\r\n",
    "\x1b[2A",
    "\x1b[J",
    "Please select a browser: (filter: ch)\r\n",
    "❯ chrome\r\n",
    "\x1b[?25h"
  ];

  const actualOutput: string[] = [];

  stub(
    Ende.stdout,
    "writeSync",
    (data: Uint8Array) => {
      const output = decoder.decode(data);
      actualOutput.push(output);
      return data.length;
    }
  );

  let readIndex = 0;

  const inputs = [
    "c",
    "h",
    "\r"
  ];

  stub(
    Ende.stdin,
    "readSync",
    (data: Uint8Array) => {
      const input = inputs[readIndex++];
      const bytes = encoder.encode(input);
      data.set(bytes);
      return bytes.length;
    }
  );

  const browser = promptSelect("Please select a browser:", [
    "safari",
    "chrome",
    "firefox"
  ]);

  assertEquals(browser, "chrome");
  assertEquals(expectedOutput, actualOutput);
  restore();
});

Ende.test("promptSelect() handles search backspace", () => {
  stub(Ende.stdin, "setRaw");
  stub(Ende.stdin, "isTerminal", () => true);
  stub(Ende, "consoleSize", () => ({ columns: 80, rows: 24 }));

  const expectedOutput = [
    "\x1b[?25l",
    "Please select a browser:\r\n",
    "❯ safari\r\n",
    "  chrome\r\n",
    "  firefox\r\n",
    "\x1b[4A",
    "\x1b[J",
    "Please select a browser: (filter: f)\r\n",
    "❯ safari\r\n",
    "  firefox\r\n",
    "\x1b[3A",
    "\x1b[J",
    "Please select a browser:\r\n",
    "❯ safari\r\n",
    "  chrome\r\n",
    "  firefox\r\n",
    "\x1b[?25h"
  ];

  const actualOutput: string[] = [];

  stub(
    Ende.stdout,
    "writeSync",
    (data: Uint8Array) => {
      const output = decoder.decode(data);
      actualOutput.push(output);
      return data.length;
    }
  );

  let readIndex = 0;

  const inputs = [
    "f",
    "\x7f",
    "\r"
  ];

  stub(
    Ende.stdin,
    "readSync",
    (data: Uint8Array) => {
      const input = inputs[readIndex++];
      const bytes = encoder.encode(input);
      data.set(bytes);
      return bytes.length;
    }
  );

  const browser = promptSelect("Please select a browser:", [
    "safari",
    "chrome",
    "firefox"
  ]);

  assertEquals(browser, "safari");
  assertEquals(expectedOutput, actualOutput);
  restore();
});

Ende.test("promptSelect() handles search no matches", () => {
  stub(Ende.stdin, "setRaw");
  stub(Ende.stdin, "isTerminal", () => true);
  stub(Ende, "consoleSize", () => ({ columns: 80, rows: 24 }));

  const expectedOutput = [
    "\x1b[?25l",
    "Please select a browser:\r\n",
    "❯ safari\r\n",
    "  chrome\r\n",
    "  firefox\r\n",
    "\x1b[4A",
    "\x1b[J",
    "Please select a browser: (filter: x)\r\n",
    "❯ firefox\r\n",
    "\x1b[2A",
    "\x1b[J",
    "Please select a browser: (filter: xy)\r\n",
    "\x1b[1A",
    "\x1b[J",
    "Please select a browser: (filter: xyz)\r\n",
    "\x1b[1A",
    "\x1b[J",
    "Please select a browser: (filter: xy)\r\n",
    "\x1b[1A",
    "\x1b[J",
    "Please select a browser: (filter: x)\r\n",
    "❯ firefox\r\n",
    "\x1b[2A",
    "\x1b[J",
    "Please select a browser:\r\n",
    "❯ safari\r\n",
    "  chrome\r\n",
    "  firefox\r\n",
    "\x1b[?25h"
  ];

  const actualOutput: string[] = [];

  stub(
    Ende.stdout,
    "writeSync",
    (data: Uint8Array) => {
      const output = decoder.decode(data);
      actualOutput.push(output);
      return data.length;
    }
  );

  let readIndex = 0;

  const inputs = [
    "x",
    "y",
    "z",
    "\x7f",
    "\x7f",
    "\x7f",
    "\r"
  ];

  stub(
    Ende.stdin,
    "readSync",
    (data: Uint8Array) => {
      const input = inputs[readIndex++];
      const bytes = encoder.encode(input);
      data.set(bytes);
      return bytes.length;
    }
  );

  const browser = promptSelect("Please select a browser:", [
    "safari",
    "chrome",
    "firefox"
  ]);

  assertEquals(browser, "safari");
  assertEquals(expectedOutput, actualOutput);
  restore();
});

Ende.test("promptSelect() handles ETX", () => {
  stub(Ende.stdin, "setRaw");
  stub(Ende.stdin, "isTerminal", () => true);
  stub(Ende, "consoleSize", () => ({ columns: 80, rows: 24 }));

  let called = false;
  stub(
    Ende,
    "exit",
    (() => {
      called = true;
    }) as never
  );

  const expectedOutput = [
    "\x1b[?25l",
    "Please select a browser:\r\n",
    "❯ safari\r\n",
    "  chrome\r\n",
    "  firefox\r\n",
    "\x1b[?25h"
  ];

  const actualOutput: string[] = [];

  stub(
    Ende.stdout,
    "writeSync",
    (data: Uint8Array) => {
      const output = decoder.decode(data);
      actualOutput.push(output);
      return data.length;
    }
  );

  let readIndex = 0;

  const inputs = [
    "\x03"
  ];

  stub(
    Ende.stdin,
    "readSync",
    (data: Uint8Array) => {
      const input = inputs[readIndex++];
      const bytes = encoder.encode(input);
      data.set(bytes);
      return bytes.length;
    }
  );

  const _browser = promptSelect("Please select a browser:", [
    "safari",
    "chrome",
    "firefox"
  ]);

  assertEquals(called, true);
  assertEquals(expectedOutput, actualOutput);
  restore();
});

Ende.test("promptSelect() supports search by typing", () => {
  stub(Ende.stdin, "setRaw");
  stub(Ende.stdin, "isTerminal", () => true);
  stub(Ende, "consoleSize", () => ({ columns: 80, rows: 24 }));

  const expectedOutput = [
    "\x1b[?25l",
    "Please select a browser:\r\n",
    "❯ safari\r\n",
    "  chrome\r\n",
    "  firefox\r\n",
    "\x1b[4A",
    "\x1b[J",
    "Please select a browser: (filter: e)\r\n",
    "❯ chrome\r\n",
    "  firefox\r\n",
    "\x1b[3A",
    "\x1b[J",
    "Please select a browser: (filter: ef)\r\n",
    "❯ firefox\r\n",
    "\x1b[2A",
    "\x1b[J",
    "Please select a browser: (filter: e)\r\n",
    "❯ chrome\r\n",
    "  firefox\r\n",
    "\x1b[3A",
    "\x1b[J",
    "Please select a browser: (filter: e)\r\n",
    "  chrome\r\n",
    "❯ firefox\r\n",
    "\x1b[3A",
    "\x1b[J",
    "Please select a browser:\r\n",
    "❯ safari\r\n", // the selection is reset when the search is changed
    "  chrome\r\n",
    "  firefox\r\n",
    "\x1b[?25h"
  ];

  const actualOutput: string[] = [];

  stub(
    Ende.stdout,
    "writeSync",
    (data: Uint8Array) => {
      const output = decoder.decode(data);
      actualOutput.push(output);
      return data.length;
    }
  );

  let readIndex = 0;

  const inputs = [
    "e",
    "f",
    "\u007F", // Backspace
    "\u001B[B", // Arrow down
    "\u007F", // Backspace
    "\r"
  ];

  stub(
    Ende.stdin,
    "readSync",
    (data: Uint8Array) => {
      const input = inputs[readIndex++];
      const bytes = encoder.encode(input);
      data.set(bytes);
      return bytes.length;
    }
  );

  const browser = promptSelect("Please select a browser:", [
    "safari",
    "chrome",
    "firefox"
  ]);

  assertEquals(expectedOutput, actualOutput);
  assertEquals(browser, "safari");
  restore();
});

Ende.test("promptSelect() handles fitToRemainingHeight option", () => {
  stub(Ende.stdin, "setRaw");
  stub(Ende.stdin, "isTerminal", () => true);
  // 24 rows, cursor at row 15, SAFE_PADDING=4: availableHeight = 24 - 15 - 4 + 1 = 6
  stub(Ende, "consoleSize", () => ({ columns: 80, rows: 24 }));

  const expectedOutput = [
    "\x1b[?25l",
    "\x1b[6n", // cursor position query
    "Please select a browser:\r\n",
    "❯ safari\r\n",
    "  chrome\r\n",
    "  firefox\r\n",
    "  brave\r\n",
    "  edge\r\n",
    "  opera\r\n",
    "  ...\r\n",
    "\x1b[8A",
    "\x1b[J",
    "Please select a browser:\r\n",
    "  safari\r\n",
    "❯ chrome\r\n",
    "  firefox\r\n",
    "  brave\r\n",
    "  edge\r\n",
    "  opera\r\n",
    "  ...\r\n",
    "\x1b[?25h"
  ];

  const actualOutput: string[] = [];

  stub(
    Ende.stdout,
    "writeSync",
    (data: Uint8Array) => {
      const output = decoder.decode(data);
      actualOutput.push(output);
      return data.length;
    }
  );

  let readIndex = 0;

  const inputs = [
    "\x1b[15;1R", // cursor position response: row 15, col 1
    "\u001B[B", // arrow down
    "\r"
  ];

  stub(
    Ende.stdin,
    "readSync",
    (data: Uint8Array) => {
      const input = inputs[readIndex++];
      const bytes = encoder.encode(input);
      data.set(bytes);
      return bytes.length;
    }
  );

  const browser = promptSelect("Please select a browser:", [
    "safari",
    "chrome",
    "firefox",
    "brave",
    "edge",
    "opera",
    "vivaldi",
    "tor"
  ], { fitToRemainingHeight: true });

  assertEquals(browser, "chrome");
  assertEquals(expectedOutput, actualOutput);
  restore();
});

Ende.test("promptSelect() always shows at least one item when height is too small", () => {
  stub(Ende.stdin, "setRaw");
  stub(Ende.stdin, "isTerminal", () => true);
  // rows(4) - SAFE_PADDING(4) = 0 available height, which previously collapsed
  // visibleLines to 0 and rendered only a scroll indicator with no content.
  stub(Ende, "consoleSize", () => ({ columns: 80, rows: 4 }));

  const expectedOutput = [
    "\x1b[?25l",
    "Please select a browser:\r\n",
    "❯ safari\r\n",
    "  ...\r\n",
    "\x1b[?25h"
  ];

  const actualOutput: string[] = [];

  stub(
    Ende.stdout,
    "writeSync",
    (data: Uint8Array) => {
      const output = decoder.decode(data);
      actualOutput.push(output);
      return data.length;
    }
  );

  let readIndex = 0;

  const inputs = [
    "\r"
  ];

  stub(
    Ende.stdin,
    "readSync",
    (data: Uint8Array) => {
      const input = inputs[readIndex++];
      const bytes = encoder.encode(input);
      data.set(bytes);
      return bytes.length;
    }
  );

  const browser = promptSelect("Please select a browser:", [
    "safari",
    "chrome",
    "firefox",
    "brave",
    "edge"
  ]);

  assertEquals(browser, "safari");
  assertEquals(expectedOutput, actualOutput);
  restore();
});
