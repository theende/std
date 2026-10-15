// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.

import { assertEquals } from "@ende/assert/equals";
import { promptSecret } from "./prompt_secret.ts";
import { restore, stub } from "@ende/testing/mock";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

Ende.test("promptSecret() handles CR", () => {
  stub(Ende.stdin, "setRaw");
  stub(Ende.stdin, "isTerminal", () => true);
  stub(Ende, "consoleSize", () => {
    return { columns: 80, rows: 20 };
  });

  const expectedOutput = [
    "Please provide the password: ",
    "\n",
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

  const password = promptSecret("Please provide the password:");
  assertEquals(password, "");
  assertEquals(expectedOutput, actualOutput);
  restore();
});

Ende.test("promptSecret() handles LF", () => {
  stub(Ende.stdin, "setRaw");
  stub(Ende.stdin, "isTerminal", () => true);
  stub(Ende, "consoleSize", () => {
    return { columns: 80, rows: 20 };
  });

  const expectedOutput = [
    "Please provide the password: ",
    "\n",
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
    "\n",
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

  const password = promptSecret("Please provide the password:");
  assertEquals(password, "");
  assertEquals(expectedOutput, actualOutput);
  restore();
});

Ende.test("promptSecret() handles input", () => {
  stub(Ende.stdin, "setRaw");
  stub(Ende.stdin, "isTerminal", () => true);
  stub(Ende, "consoleSize", () => {
    return { columns: 80, rows: 20 };
  });

  const expectedOutput = [
    "Please provide the password: ",
    "\r\x1b[K",
    "Please provide the password: *",
    "\r\x1b[K",
    "Please provide the password: **",
    "\r\x1b[K",
    "Please provide the password: ***",
    "\r\x1b[K",
    "Please provide the password: ****",
    "\n",
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
    "d",
    "e",
    "n",
    "o",
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

  const password = promptSecret("Please provide the password:");

  assertEquals(password, "deno");
  assertEquals(expectedOutput, actualOutput);
  restore();
});

Ende.test("promptSecret() handles DEL", () => {
  stub(Ende.stdin, "setRaw");
  stub(Ende.stdin, "isTerminal", () => true);
  stub(Ende, "consoleSize", () => {
    return { columns: 80, rows: 20 };
  });

  const expectedOutput = [
    "Please provide the password: ",
    "\r\x1b[K",
    "Please provide the password: *",
    "\r\x1b[K",
    "Please provide the password: ",
    "\r\x1b[K",
    "Please provide the password: *",
    "\r\x1b[K",
    "Please provide the password: **",
    "\r\x1b[K",
    "Please provide the password: ***",
    "\r\x1b[K",
    "Please provide the password: ****",
    "\n",
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
    "n",
    "\x7f",
    "d",
    "e",
    "n",
    "o",
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

  const password = promptSecret("Please provide the password:");

  assertEquals(password, "deno");
  assertEquals(expectedOutput, actualOutput);
  restore();
});

Ende.test("promptSecret() handles BS", () => {
  stub(Ende.stdin, "setRaw");
  stub(Ende.stdin, "isTerminal", () => true);
  stub(Ende, "consoleSize", () => {
    return { columns: 80, rows: 20 };
  });

  const expectedOutput = [
    "Please provide the password: ",
    "\r\x1b[K",
    "Please provide the password: *",
    "\r\x1b[K",
    "Please provide the password: ",
    "\r\x1b[K",
    "Please provide the password: *",
    "\r\x1b[K",
    "Please provide the password: **",
    "\r\x1b[K",
    "Please provide the password: ***",
    "\r\x1b[K",
    "Please provide the password: ****",
    "\n",
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
    "n",
    "\b",
    "d",
    "e",
    "n",
    "o",
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

  const password = promptSecret("Please provide the password:");

  assertEquals(password, "deno");
  assertEquals(expectedOutput, actualOutput);
  restore();
});

Ende.test("promptSecret() handles clear option", () => {
  stub(Ende.stdin, "setRaw");
  stub(Ende.stdin, "isTerminal", () => true);
  stub(Ende, "consoleSize", () => {
    return { columns: 80, rows: 20 };
  });

  const expectedOutput = [
    "Please provide the password: ",
    "\r\x1b[K",
    "Please provide the password: *",
    "\r\x1b[K",
    "Please provide the password: **",
    "\r\x1b[K",
    "Please provide the password: ***",
    "\r\x1b[K",
    "Please provide the password: ****",
    "\r\x1b[K",
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
    "d",
    "e",
    "n",
    "o",
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

  const password = promptSecret("Please provide the password:", {
    clear: true,
  });

  assertEquals(password, "deno");
  assertEquals(expectedOutput, actualOutput);
  restore();
});

Ende.test("promptSecret() handles mask option", () => {
  stub(Ende.stdin, "setRaw");
  stub(Ende.stdin, "isTerminal", () => true);
  stub(Ende, "consoleSize", () => {
    return { columns: 80, rows: 20 };
  });

  const expectedOutput = [
    "Please provide the password: ",
    "\r\x1b[K",
    "Please provide the password: $",
    "\r\x1b[K",
    "Please provide the password: $$",
    "\r\x1b[K",
    "Please provide the password: $$$",
    "\r\x1b[K",
    "Please provide the password: $$$$",
    "\n",
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
    "d",
    "e",
    "n",
    "o",
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

  const password = promptSecret("Please provide the password:", { mask: "$" });

  assertEquals(password, "deno");
  assertEquals(expectedOutput, actualOutput);
  restore();
});

Ende.test("promptSecret() handles empty mask option", () => {
  stub(Ende.stdin, "setRaw");
  stub(Ende.stdin, "isTerminal", () => true);
  stub(Ende, "consoleSize", () => {
    return { columns: 80, rows: 20 };
  });

  const expectedOutput = [
    "Please provide the password: ",
    "\n",
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
    "d",
    "e",
    "n",
    "o",
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

  const password = promptSecret("Please provide the password:", { mask: "" });

  assertEquals(password, "deno");
  assertEquals(expectedOutput, actualOutput);
  restore();
});

Ende.test("promptSecret() returns null if Ende.stdin.isTerminal() is false", () => {
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

  const password = promptSecret("Please provide the password:");
  assertEquals(password, null);
  assertEquals(expectedOutput, actualOutput);
  restore();
});

Ende.test("promptSecret() handles null readSync", () => {
  stub(Ende.stdin, "setRaw");
  stub(Ende.stdin, "isTerminal", () => true);
  stub(Ende, "consoleSize", () => {
    return { columns: 80, rows: 20 };
  });

  const expectedOutput = [
    "Please provide the password: ",
    "\n",
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

  stub(Ende.stdin, "readSync", () => null);

  const password = promptSecret("Please provide the password:");

  assertEquals(password, "");
  assertEquals(expectedOutput, actualOutput);
  restore();
});

Ende.test("promptSecret() handles empty readSync", () => {
  stub(Ende.stdin, "setRaw");
  stub(Ende.stdin, "isTerminal", () => true);
  stub(Ende, "consoleSize", () => {
    return { columns: 80, rows: 20 };
  });

  const expectedOutput = [
    "Please provide the password: ",
    "\n",
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

  stub(Ende.stdin, "readSync", () => 0);

  const password = promptSecret("Please provide the password:");

  assertEquals(password, "");
  assertEquals(expectedOutput, actualOutput);
  restore();
});

Ende.test("promptSecret() wraps characters wider than console columns", () => {
  stub(Ende.stdin, "setRaw");
  stub(Ende.stdin, "isTerminal", () => true);
  stub(Ende, "consoleSize", () => {
    return { columns: 5, rows: 20 };
  });

  const expectedOutput = [
    "? ",
    "\r\x1b[K",
    "? *",
    "\r\x1b[K",
    "? **",
    "\r\x1b[K",
    "? ***",
    "*",
    "\r\x1b[K",
    "**",
    "\r\x1b[K",
    "***",
    "\r\x1b[K",
    "****",
    "\r\x1b[K",
    "*****",
    "*",
    "\r\x1b[K",
    "**",
    "\n",
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
    "d",
    "e",
    "n",
    "o",
    " ",
    "r",
    "u",
    "l",
    "e",
    "s",
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

  const password = promptSecret("?");

  assertEquals(password, "deno rules");
  assertEquals(expectedOutput, actualOutput);
  restore();
});

Ende.test("promptSecret() returns to previous line when deleting characters", () => {
  stub(Ende.stdin, "setRaw");
  stub(Ende.stdin, "isTerminal", () => true);
  stub(Ende, "consoleSize", () => {
    return { columns: 6, rows: 20 };
  });

  const expectedOutput = [
    "? ",
    "\r\u001b[K",
    "? *",
    "\r\u001b[K",
    "? **",
    "\r\u001b[K",
    "? ***",
    "\r\u001b[K",
    "? ****",
    "*",
    "\r\u001b[K",
    "**",
    "\r\u001b[K",
    "***",
    "\r\u001b[K",
    "****",
    "\r\u001b[K",
    "*****",
    "\r\u001b[K",
    "******",
    "*",
    "\r\u001b[K",
    "**",
    "\r\u001b[K",
    "***",
    "\r\u001b[K",
    "**",
    "\r\u001b[K",
    "*",
    "\r\u001b[K",
    "\r\u001b[1F",
    "******",
    "\r\u001b[K",
    "*****",
    "\r\u001b[K",
    "****",
    "\r\u001b[K",
    "***",
    "\r\u001b[K",
    "**",
    "\r\u001b[K",
    "*",
    "\r\u001b[K",
    "\r\u001b[1F",
    "? ****",
    "\n",
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
    "d",
    "e",
    "n",
    "o",
    " ",
    "r",
    "u",
    "l",
    "e",
    "s",
    "!",
    "!",
    "!",
    "\x7f",
    "\x7f",
    "\x7f",
    "\x7f",
    "\x7f",
    "\x7f",
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

  const password = promptSecret("?");

  assertEquals(password, "deno");
  assertEquals(expectedOutput, actualOutput);
  restore();
});
