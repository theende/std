// Copyright 2018-2026 the Deno authors. MIT license.

import { assertEquals } from "@std/assert/equals";
import { promptMultipleSelect } from "./unstable_prompt_multiple_select.ts";
import { restore, stub } from "@std/testing/mock";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

Ende.test("promptMultipleSelect() handles enter", () => {
  stub(Ende.stdin, "setRaw");
  stub(Ende.stdin, "isTerminal", () => true);
  stub(Ende, "consoleSize", () => ({ columns: 80, rows: 24 }));

  const expectedOutput = [
    "\x1b[?25l",
    "Please select browsers:\r\n",
    "❯ ◯ safari\r\n",
    "  ◯ chrome\r\n",
    "  ◯ firefox\r\n",

    "\x1b[?25h",
  ];

  const actualOutput: string[] = [];

  stub(
    Ende.stdout,
    "writeSync",
    (data: Uint8Array) => {
      const output = decoder.decode(data);
      actualOutput.push(output);
      return data.length;
    },
  );

  let readIndex = 0;

  const inputs = [
    "\r",
  ];

  stub(
    Ende.stdin,
    "readSync",
    (data: Uint8Array) => {
      const input = inputs[readIndex++];
      const bytes = encoder.encode(input);
      data.set(bytes);
      return bytes.length;
    },
  );

  const browsers = promptMultipleSelect("Please select browsers:", [
    "safari",
    "chrome",
    "firefox",
  ]);

  assertEquals(browsers, []);
  assertEquals(expectedOutput, actualOutput);
  restore();
});

Ende.test("promptMultipleSelect() handles selection", () => {
  stub(Ende.stdin, "setRaw");
  stub(Ende.stdin, "isTerminal", () => true);
  stub(Ende, "consoleSize", () => ({ columns: 80, rows: 24 }));

  const expectedOutput = [
    "\x1b[?25l",
    "Please select browsers:\r\n",
    "❯ ◯ safari\r\n",
    "  ◯ chrome\r\n",
    "  ◯ firefox\r\n",
    "\x1b[4A",
    "\x1b[J",
    "Please select browsers:\r\n",
    "❯ ◉ safari\r\n",
    "  ◯ chrome\r\n",
    "  ◯ firefox\r\n",

    "\x1b[?25h",
  ];

  const actualOutput: string[] = [];

  stub(
    Ende.stdout,
    "writeSync",
    (data: Uint8Array) => {
      const output = decoder.decode(data);
      actualOutput.push(output);
      return data.length;
    },
  );

  let readIndex = 0;

  const inputs = [
    " ",
    "\r",
  ];

  stub(
    Ende.stdin,
    "readSync",
    (data: Uint8Array) => {
      const input = inputs[readIndex++];
      const bytes = encoder.encode(input);
      data.set(bytes);
      return bytes.length;
    },
  );

  const browsers = promptMultipleSelect("Please select browsers:", [
    { label: "safari", value: 1 },
    { label: "chrome", value: 2 },
    { label: "firefox", value: 3 },
  ]);

  assertEquals(browsers, [{ label: "safari", value: 1 }]);
  assertEquals(expectedOutput, actualOutput);
  restore();
});

Ende.test("promptMultipleSelect() handles multiple selection", () => {
  stub(Ende.stdin, "setRaw");
  stub(Ende.stdin, "isTerminal", () => true);
  stub(Ende, "consoleSize", () => ({ columns: 80, rows: 24 }));

  const expectedOutput = [
    "\x1b[?25l",
    "Please select browsers:\r\n",
    "❯ ◯ safari\r\n",
    "  ◯ chrome\r\n",
    "  ◯ firefox\r\n",
    "\x1b[4A",
    "\x1b[J",
    "Please select browsers:\r\n",
    "❯ ◉ safari\r\n",
    "  ◯ chrome\r\n",
    "  ◯ firefox\r\n",
    "\x1b[4A",
    "\x1b[J",
    "Please select browsers:\r\n",
    "  ◉ safari\r\n",
    "❯ ◯ chrome\r\n",
    "  ◯ firefox\r\n",
    "\x1b[4A",
    "\x1b[J",
    "Please select browsers:\r\n",
    "  ◉ safari\r\n",
    "❯ ◉ chrome\r\n",
    "  ◯ firefox\r\n",
    "\x1b[4A",
    "\x1b[J",
    "Please select browsers:\r\n",
    "  ◉ safari\r\n",
    "  ◉ chrome\r\n",
    "❯ ◯ firefox\r\n",
    "\x1b[4A",
    "\x1b[J",

    "Please select browsers:\r\n",
    "  ◉ safari\r\n",
    "  ◉ chrome\r\n",
    "❯ ◉ firefox\r\n",
    "\x1b[?25h",
  ];

  const actualOutput: string[] = [];

  stub(
    Ende.stdout,
    "writeSync",
    (data: Uint8Array) => {
      const output = decoder.decode(data);
      actualOutput.push(output);
      return data.length;
    },
  );

  let readIndex = 0;

  const inputs = [
    " ",
    "\u001B[B",
    " ",
    "\u001B[B",
    " ",
    "\r",
  ];

  stub(
    Ende.stdin,
    "readSync",
    (data: Uint8Array) => {
      const input = inputs[readIndex++];
      const bytes = encoder.encode(input);
      data.set(bytes);
      return bytes.length;
    },
  );

  const browsers = promptMultipleSelect("Please select browsers:", [
    { label: "safari", value: 1 },
    { label: "chrome", value: 2 },
    { label: "firefox", value: 3 },
  ]);

  assertEquals(browsers, [
    { label: "safari", value: 1 },
    { label: "chrome", value: 2 },
    { label: "firefox", value: 3 },
  ]);
  assertEquals(expectedOutput, actualOutput);
  restore();
});

Ende.test("promptMultipleSelect() handles arrow down", () => {
  stub(Ende.stdin, "setRaw");
  stub(Ende.stdin, "isTerminal", () => true);
  stub(Ende, "consoleSize", () => ({ columns: 80, rows: 24 }));

  const expectedOutput = [
    "\x1b[?25l",
    "Please select browsers:\r\n",
    "❯ ◯ safari\r\n",
    "  ◯ chrome\r\n",
    "  ◯ firefox\r\n",
    "\x1b[4A",
    "\x1b[J",
    "Please select browsers:\r\n",
    "  ◯ safari\r\n",
    "❯ ◯ chrome\r\n",
    "  ◯ firefox\r\n",
    "\x1b[4A",
    "\x1b[J",
    "Please select browsers:\r\n",
    "  ◯ safari\r\n",
    "  ◯ chrome\r\n",
    "❯ ◯ firefox\r\n",
    "\x1b[4A",
    "\x1b[J",

    "Please select browsers:\r\n",
    "  ◯ safari\r\n",
    "  ◯ chrome\r\n",
    "❯ ◉ firefox\r\n",
    "\x1b[?25h",
  ];

  const actualOutput: string[] = [];

  stub(
    Ende.stdout,
    "writeSync",
    (data: Uint8Array) => {
      const output = decoder.decode(data);
      actualOutput.push(output);
      return data.length;
    },
  );

  let readIndex = 0;

  const inputs = [
    "\u001B[B",
    "\u001B[B",
    " ",
    "\r",
  ];

  stub(
    Ende.stdin,
    "readSync",
    (data: Uint8Array) => {
      const input = inputs[readIndex++];
      const bytes = encoder.encode(input);
      data.set(bytes);
      return bytes.length;
    },
  );

  const browsers = promptMultipleSelect("Please select browsers:", [
    { label: "safari", value: 1 },
    { label: "chrome", value: 2 },
    { label: "firefox", value: 3 },
  ]);

  assertEquals(browsers, [{ label: "firefox", value: 3 }]);
  assertEquals(expectedOutput, actualOutput);
  restore();
});

Ende.test("promptMultipleSelect() handles arrow up", () => {
  stub(Ende.stdin, "setRaw");
  stub(Ende.stdin, "isTerminal", () => true);
  stub(Ende, "consoleSize", () => ({ columns: 80, rows: 24 }));

  const expectedOutput = [
    "\x1b[?25l",
    "Please select browsers:\r\n",
    "❯ ◯ safari\r\n",
    "  ◯ chrome\r\n",
    "  ◯ firefox\r\n",
    "\x1b[4A",
    "\x1b[J",
    "Please select browsers:\r\n",
    "  ◯ safari\r\n",
    "❯ ◯ chrome\r\n",
    "  ◯ firefox\r\n",
    "\x1b[4A",
    "\x1b[J",
    "Please select browsers:\r\n",
    "❯ ◯ safari\r\n",
    "  ◯ chrome\r\n",
    "  ◯ firefox\r\n",
    "\x1b[4A",
    "\x1b[J",
    "Please select browsers:\r\n",
    "❯ ◉ safari\r\n",
    "  ◯ chrome\r\n",
    "  ◯ firefox\r\n",

    "\x1b[?25h",
  ];

  const actualOutput: string[] = [];

  stub(
    Ende.stdout,
    "writeSync",
    (data: Uint8Array) => {
      const output = decoder.decode(data);
      actualOutput.push(output);
      return data.length;
    },
  );

  let readIndex = 0;

  const inputs = [
    "\u001B[B",
    "\u001B[A",
    " ",
    "\r",
  ];

  stub(
    Ende.stdin,
    "readSync",
    (data: Uint8Array) => {
      const input = inputs[readIndex++];
      const bytes = encoder.encode(input);
      data.set(bytes);
      return bytes.length;
    },
  );

  const browsers = promptMultipleSelect("Please select browsers:", [
    "safari",
    "chrome",
    "firefox",
  ]);

  assertEquals(browsers, ["safari"]);
  assertEquals(expectedOutput, actualOutput);
  restore();
});

Ende.test("promptMultipleSelect() handles up index overflow", () => {
  stub(Ende.stdin, "setRaw");
  stub(Ende.stdin, "isTerminal", () => true);
  stub(Ende, "consoleSize", () => ({ columns: 80, rows: 24 }));

  const expectedOutput = [
    "\x1b[?25l",
    "Please select browsers:\r\n",
    "❯ ◯ safari\r\n",
    "  ◯ chrome\r\n",
    "  ◯ firefox\r\n",
    "\x1b[4A",
    "\x1b[J",
    "Please select browsers:\r\n",
    "  ◯ safari\r\n",
    "  ◯ chrome\r\n",
    "❯ ◯ firefox\r\n",
    "\x1b[4A",
    "\x1b[J",
    "Please select browsers:\r\n",
    "  ◯ safari\r\n",
    "  ◯ chrome\r\n",
    "❯ ◉ firefox\r\n",
    "\x1b[?25h",
  ];

  const actualOutput: string[] = [];

  stub(
    Ende.stdout,
    "writeSync",
    (data: Uint8Array) => {
      const output = decoder.decode(data);
      actualOutput.push(output);
      return data.length;
    },
  );

  let readIndex = 0;

  const inputs = [
    "\u001B[A",
    " ",
    "\r",
  ];

  stub(
    Ende.stdin,
    "readSync",
    (data: Uint8Array) => {
      const input = inputs[readIndex++];
      const bytes = encoder.encode(input);
      data.set(bytes);
      return bytes.length;
    },
  );

  const browsers = promptMultipleSelect("Please select browsers:", [
    "safari",
    "chrome",
    "firefox",
  ]);

  assertEquals(browsers, ["firefox"]);
  assertEquals(expectedOutput, actualOutput);
  restore();
});

Ende.test("promptMultipleSelect() handles down index overflow", () => {
  stub(Ende.stdin, "setRaw");
  stub(Ende.stdin, "isTerminal", () => true);
  stub(Ende, "consoleSize", () => ({ columns: 80, rows: 24 }));

  const expectedOutput = [
    "\x1b[?25l",
    "Please select browsers:\r\n",
    "❯ ◯ safari\r\n",
    "  ◯ chrome\r\n",
    "  ◯ firefox\r\n",
    "\x1b[4A",
    "\x1b[J",
    "Please select browsers:\r\n",
    "  ◯ safari\r\n",
    "❯ ◯ chrome\r\n",
    "  ◯ firefox\r\n",
    "\x1b[4A",
    "\x1b[J",
    "Please select browsers:\r\n",
    "  ◯ safari\r\n",
    "  ◯ chrome\r\n",
    "❯ ◯ firefox\r\n",
    "\x1b[4A",
    "\x1b[J",

    "Please select browsers:\r\n",
    "❯ ◯ safari\r\n",
    "  ◯ chrome\r\n",
    "  ◯ firefox\r\n",
    "\x1b[4A",
    "\x1b[J",
    "Please select browsers:\r\n",
    "❯ ◉ safari\r\n",
    "  ◯ chrome\r\n",
    "  ◯ firefox\r\n",

    "\x1b[?25h",
  ];

  const actualOutput: string[] = [];

  stub(
    Ende.stdout,
    "writeSync",
    (data: Uint8Array) => {
      const output = decoder.decode(data);
      actualOutput.push(output);
      return data.length;
    },
  );

  let readIndex = 0;

  const inputs = [
    "\u001B[B",
    "\u001B[B",
    "\u001B[B",
    " ",
    "\r",
  ];

  stub(
    Ende.stdin,
    "readSync",
    (data: Uint8Array) => {
      const input = inputs[readIndex++];
      const bytes = encoder.encode(input);
      data.set(bytes);
      return bytes.length;
    },
  );

  const browsers = promptMultipleSelect("Please select browsers:", [
    "safari",
    "chrome",
    "firefox",
  ]);

  assertEquals(browsers, ["safari"]);
  assertEquals(expectedOutput, actualOutput);
  restore();
});

Ende.test("promptMultipleSelect() scrolls down and display lines correctly", () => {
  stub(Ende.stdin, "setRaw");
  stub(Ende.stdin, "isTerminal", () => true);
  stub(Ende, "consoleSize", () => ({ columns: 80, rows: 24 }));

  const expectedOutput = [
    "\x1b[?25l",
    "Please select browsers:\r\n",
    "❯ ◯ safari\r\n",
    "  ◯ chrome\r\n",
    "  ◯ firefox\r\n",
    "  ...\r\n",
    "\x1b[5A",
    "\x1b[J",
    "Please select browsers:\r\n",
    "  ◯ safari\r\n",
    "❯ ◯ chrome\r\n",
    "  ◯ firefox\r\n",
    "  ...\r\n",
    "\x1b[5A",
    "\x1b[J",
    "Please select browsers:\r\n",
    "  ◯ safari\r\n",
    "  ◯ chrome\r\n",
    "❯ ◯ firefox\r\n",
    "  ...\r\n",
    "\x1b[5A",
    "\x1b[J",
    "Please select browsers:\r\n",
    "  ...\r\n",
    "  ◯ chrome\r\n",
    "  ◯ firefox\r\n",
    "❯ ◯ brave\r\n",
    "\x1b[5A",
    "\x1b[J",
    "Please select browsers:\r\n",
    "❯ ◯ safari\r\n",
    "  ◯ chrome\r\n",
    "  ◯ firefox\r\n",
    "  ...\r\n",
    "\x1b[5A",
    "\x1b[J",
    "Please select browsers:\r\n",
    "❯ ◉ safari\r\n",
    "  ◯ chrome\r\n",
    "  ◯ firefox\r\n",
    "  ...\r\n",
    "\x1b[?25h",
  ];

  const actualOutput: string[] = [];

  stub(
    Ende.stdout,
    "writeSync",
    (data: Uint8Array) => {
      const output = decoder.decode(data);
      actualOutput.push(output);
      return data.length;
    },
  );

  let readIndex = 0;

  const inputs = [
    "\u001B[B",
    "\u001B[B",
    "\u001B[B",
    "\u001B[B",
    " ",
    "\r",
  ];

  stub(
    Ende.stdin,
    "readSync",
    (data: Uint8Array) => {
      const input = inputs[readIndex++];
      const bytes = encoder.encode(input);
      data.set(bytes);
      return bytes.length;
    },
  );

  const browser = promptMultipleSelect("Please select browsers:", [
    "safari",
    "chrome",
    "firefox",
    "brave",
  ], { visibleLines: 3 });

  assertEquals(browser, ["safari"]);
  assertEquals(expectedOutput, actualOutput);
  restore();
});

Ende.test("promptMultipleSelect() handles clear option", () => {
  stub(Ende.stdin, "setRaw");
  stub(Ende.stdin, "isTerminal", () => true);
  stub(Ende, "consoleSize", () => ({ columns: 80, rows: 24 }));

  const expectedOutput = [
    "\x1b[?25l",
    "Please select browsers:\r\n",
    "❯ ◯ safari\r\n",
    "  ◯ chrome\r\n",
    "  ◯ firefox\r\n",
    "\x1b[4A",
    "\x1b[J",
    "Please select browsers:\r\n",
    "❯ ◉ safari\r\n",
    "  ◯ chrome\r\n",
    "  ◯ firefox\r\n",
    "\x1b[4A",
    "\x1b[J",
    "\x1b[?25h",
  ];

  const actualOutput: string[] = [];

  stub(
    Ende.stdout,
    "writeSync",
    (data: Uint8Array) => {
      const output = decoder.decode(data);
      actualOutput.push(output);
      return data.length;
    },
  );

  let readIndex = 0;

  const inputs = [
    " ",
    "\r",
  ];

  stub(
    Ende.stdin,
    "readSync",
    (data: Uint8Array) => {
      const input = inputs[readIndex++];
      const bytes = encoder.encode(input);
      data.set(bytes);
      return bytes.length;
    },
  );

  const browsers = promptMultipleSelect("Please select browsers:", [
    "safari",
    "chrome",
    "firefox",
  ], { clear: true });

  assertEquals(browsers, ["safari"]);
  assertEquals(expectedOutput, actualOutput);
  restore();
});

Ende.test("promptMultipleSelect() handles ETX", () => {
  stub(Ende.stdin, "setRaw");
  stub(Ende.stdin, "isTerminal", () => true);
  stub(Ende, "consoleSize", () => ({ columns: 80, rows: 24 }));

  let called = false;
  stub(
    Ende,
    "exit",
    (() => {
      called = true;
    }) as never,
  );

  const expectedOutput = [
    "\x1b[?25l",
    "Please select browsers:\r\n",
    "❯ ◯ safari\r\n",
    "  ◯ chrome\r\n",
    "  ◯ firefox\r\n",
    "\x1b[?25h",
  ];

  const actualOutput: string[] = [];

  stub(
    Ende.stdout,
    "writeSync",
    (data: Uint8Array) => {
      const output = decoder.decode(data);
      actualOutput.push(output);
      return data.length;
    },
  );

  let readIndex = 0;

  const inputs = [
    "\x03",
  ];

  stub(
    Ende.stdin,
    "readSync",
    (data: Uint8Array) => {
      const input = inputs[readIndex++];
      const bytes = encoder.encode(input);
      data.set(bytes);
      return bytes.length;
    },
  );

  const _browsers = promptMultipleSelect("Please select browsers:", [
    "safari",
    "chrome",
    "firefox",
  ]);

  assertEquals(called, true);
  assertEquals(expectedOutput, actualOutput);
  restore();
});

Ende.test("promptMultipleSelect() supports search by typing", () => {
  stub(Ende.stdin, "setRaw");
  stub(Ende.stdin, "isTerminal", () => true);
  stub(Ende, "consoleSize", () => ({ columns: 80, rows: 24 }));

  const expectedOutput = [
    "\x1b[?25l",
    "Please select browsers:\r\n",
    "❯ ◯ safari\r\n",
    "  ◯ chrome\r\n",
    "  ◯ firefox\r\n",
    "\x1b[4A",
    "\x1b[J",
    "Please select browsers: (filter: f)\r\n",
    "❯ ◯ safari\r\n",
    "  ◯ firefox\r\n",
    "\x1b[3A",
    "\x1b[J",
    "Please select browsers: (filter: f)\r\n",
    "  ◯ safari\r\n",
    "❯ ◯ firefox\r\n",
    "\x1b[3A",
    "\x1b[J",
    "Please select browsers: (filter: f)\r\n",
    "  ◯ safari\r\n",
    "❯ ◉ firefox\r\n",
    "\x1b[3A",
    "\x1b[J",
    "Please select browsers: (filter: fa)\r\n",
    "❯ ◯ safari\r\n",
    "\x1b[2A",
    "\x1b[J",
    "Please select browsers: (filter: f)\r\n",
    "❯ ◯ safari\r\n",
    "  ◉ firefox\r\n",
    "\x1b[3A",
    "\x1b[J",
    "Please select browsers:\r\n",
    "❯ ◯ safari\r\n",
    "  ◯ chrome\r\n",
    "  ◉ firefox\r\n",
    "\x1b[4A",
    "\x1b[J",
    "Please select browsers: (filter: z)\r\n",
    "\x1b[?25h",
  ];

  const actualOutput: string[] = [];

  stub(
    Ende.stdout,
    "writeSync",
    (data: Uint8Array) => {
      const output = decoder.decode(data);
      actualOutput.push(output);
      return data.length;
    },
  );

  let readIndex = 0;

  const inputs = [
    "f",
    "\u001B[B", // Arrow down
    " ",
    "a",
    "\u007F", // Backspace
    "\u007F", // Backspace
    "z",
    "\r", // Enter
  ];

  stub(
    Ende.stdin,
    "readSync",
    (data: Uint8Array) => {
      const input = inputs[readIndex++];
      const bytes = encoder.encode(input);
      data.set(bytes);
      return bytes.length;
    },
  );

  const browsers = promptMultipleSelect("Please select browsers:", [
    "safari",
    "chrome",
    "firefox",
  ]);

  assertEquals(expectedOutput, actualOutput);
  assertEquals(browsers, ["firefox"]);
  restore();
});

Ende.test("promptMultipleSelect() handles search", () => {
  stub(Ende.stdin, "setRaw");
  stub(Ende.stdin, "isTerminal", () => true);
  stub(Ende, "consoleSize", () => ({ columns: 80, rows: 24 }));

  const expectedOutput = [
    "\x1b[?25l",
    "Please select browsers:\r\n",
    "❯ ◯ safari\r\n",
    "  ◯ chrome\r\n",
    "  ◯ firefox\r\n",
    "\x1b[4A",
    "\x1b[J",
    "Please select browsers: (filter: c)\r\n",
    "❯ ◯ chrome\r\n",
    "\x1b[2A",
    "\x1b[J",
    "Please select browsers: (filter: ch)\r\n",
    "❯ ◯ chrome\r\n",
    "\x1b[2A",
    "\x1b[J",
    "Please select browsers: (filter: ch)\r\n",
    "❯ ◉ chrome\r\n",
    "\x1b[?25h",
  ];

  const actualOutput: string[] = [];

  stub(
    Ende.stdout,
    "writeSync",
    (data: Uint8Array) => {
      const output = decoder.decode(data);
      actualOutput.push(output);
      return data.length;
    },
  );

  let readIndex = 0;

  const inputs = [
    "c",
    "h",
    " ",
    "\r",
  ];

  stub(
    Ende.stdin,
    "readSync",
    (data: Uint8Array) => {
      const input = inputs[readIndex++];
      const bytes = encoder.encode(input);
      data.set(bytes);
      return bytes.length;
    },
  );

  const browsers = promptMultipleSelect("Please select browsers:", [
    "safari",
    "chrome",
    "firefox",
  ]);

  assertEquals(browsers, ["chrome"]);
  assertEquals(expectedOutput, actualOutput);
  restore();
});

Ende.test("promptMultipleSelect() handles search backspace", () => {
  stub(Ende.stdin, "setRaw");
  stub(Ende.stdin, "isTerminal", () => true);
  stub(Ende, "consoleSize", () => ({ columns: 80, rows: 24 }));

  const expectedOutput = [
    "\x1b[?25l",
    "Please select browsers:\r\n",
    "❯ ◯ safari\r\n",
    "  ◯ chrome\r\n",
    "  ◯ firefox\r\n",
    "\x1b[4A",
    "\x1b[J",
    "Please select browsers: (filter: f)\r\n",
    "❯ ◯ safari\r\n",
    "  ◯ firefox\r\n",
    "\x1b[3A",
    "\x1b[J",
    "Please select browsers:\r\n",
    "❯ ◯ safari\r\n",
    "  ◯ chrome\r\n",
    "  ◯ firefox\r\n",
    "\x1b[4A",
    "\x1b[J",
    "Please select browsers:\r\n",
    "❯ ◉ safari\r\n",
    "  ◯ chrome\r\n",
    "  ◯ firefox\r\n",
    "\x1b[?25h",
  ];

  const actualOutput: string[] = [];

  stub(
    Ende.stdout,
    "writeSync",
    (data: Uint8Array) => {
      const output = decoder.decode(data);
      actualOutput.push(output);
      return data.length;
    },
  );

  let readIndex = 0;

  const inputs = [
    "f",
    "\x7f",
    " ",
    "\r",
  ];

  stub(
    Ende.stdin,
    "readSync",
    (data: Uint8Array) => {
      const input = inputs[readIndex++];
      const bytes = encoder.encode(input);
      data.set(bytes);
      return bytes.length;
    },
  );

  const browsers = promptMultipleSelect("Please select browsers:", [
    "safari",
    "chrome",
    "firefox",
  ]);

  assertEquals(browsers, ["safari"]);
  assertEquals(expectedOutput, actualOutput);
  restore();
});

Ende.test("promptMultipleSelect() handles search no matches", () => {
  stub(Ende.stdin, "setRaw");
  stub(Ende.stdin, "isTerminal", () => true);
  stub(Ende, "consoleSize", () => ({ columns: 80, rows: 24 }));

  const expectedOutput = [
    "\x1b[?25l",
    "Please select browsers:\r\n",
    "❯ ◯ safari\r\n",
    "  ◯ chrome\r\n",
    "  ◯ firefox\r\n",
    "\x1b[4A",
    "\x1b[J",
    "Please select browsers: (filter: x)\r\n",
    "❯ ◯ firefox\r\n",
    "\x1b[2A",
    "\x1b[J",
    "Please select browsers: (filter: xy)\r\n",
    "\x1b[1A",
    "\x1b[J",
    "Please select browsers: (filter: xyz)\r\n",
    "\x1b[1A",
    "\x1b[J",
    "Please select browsers: (filter: xy)\r\n",
    "\x1b[1A",
    "\x1b[J",
    "Please select browsers: (filter: x)\r\n",
    "❯ ◯ firefox\r\n",
    "\x1b[2A",
    "\x1b[J",
    "Please select browsers:\r\n",
    "❯ ◯ safari\r\n",
    "  ◯ chrome\r\n",
    "  ◯ firefox\r\n",
    "\x1b[?25h",
  ];

  const actualOutput: string[] = [];

  stub(
    Ende.stdout,
    "writeSync",
    (data: Uint8Array) => {
      const output = decoder.decode(data);
      actualOutput.push(output);
      return data.length;
    },
  );

  let readIndex = 0;

  const inputs = [
    "x",
    "y",
    "z",
    "\x7f",
    "\x7f",
    "\x7f",
    "\r",
  ];

  stub(
    Ende.stdin,
    "readSync",
    (data: Uint8Array) => {
      const input = inputs[readIndex++];
      const bytes = encoder.encode(input);
      data.set(bytes);
      return bytes.length;
    },
  );

  const browsers = promptMultipleSelect("Please select browsers:", [
    "safari",
    "chrome",
    "firefox",
  ]);

  assertEquals(browsers, []);
  assertEquals(expectedOutput, actualOutput);
  restore();
});

Ende.test("promptMultipleSelect() returns null if Ende.stdin.isTerminal() is false", () => {
  stub(Ende.stdin, "setRaw");
  stub(Ende.stdin, "isTerminal", () => false);

  const expectedOutput: string[] = [];

  const actualOutput: string[] = [];

  stub(
    Ende.stdout,
    "writeSync",
    (data: Uint8Array) => {
      const output = decoder.decode(data);
      actualOutput.push(output);
      return data.length;
    },
  );

  const browsers = promptMultipleSelect("Please select browsers:", [
    "safari",
    "chrome",
    "firefox",
  ]);
  assertEquals(browsers, null);
  assertEquals(expectedOutput, actualOutput);
  restore();
});
