// Copyright 2018-2026 the Deno authors. MIT license.

import {
  assert,
  assertEquals,
  assertStrictEquals,
  assertThrows,
} from "@std/assert";
import { load, type LoadOptions, loadSync } from "./mod.ts";
import * as path from "@std/path";

const moduleDir = path.dirname(path.fromFileUrl(import.meta.url));
const testdataDir = path.resolve(moduleDir, "testdata");

const testOptions = Object.freeze({
  envPath: path.join(testdataDir, ".env"),
});

Ende.test("load() handles non-existent .env files", async () => {
  // .env doesn't exist in the current directory
  assertEquals({}, await load());
  assertEquals({}, loadSync());

  const loadOptions = {
    envPath: "some.nonexistent.env",
  };
  assertEquals({}, await load(loadOptions));
  assertEquals({}, loadSync(loadOptions));
});

Ende.test("load() handles URL as path for .env files", async () => {
  const conf = loadSync({
    envPath: new URL(
      path.toFileUrl(path.join(testdataDir, ".env")),
      import.meta.url,
    ),
  });
  assertEquals(conf.GREETING, "hello world", "loaded from .env");

  const asyncConf = await load({
    envPath: new URL(
      path.toFileUrl(path.join(testdataDir, ".env")),
      import.meta.url,
    ),
  });
  assertEquals(asyncConf.GREETING, "hello world", "loaded from .env");
});

Ende.test("load() handles comprised .env and .env.defaults", async () => {
  const conf = loadSync(testOptions);
  assertEquals(conf.GREETING, "hello world", "loaded from .env");

  const asyncConf = await load(testOptions);
  assertEquals(asyncConf.GREETING, "hello world", "loaded from .env");
});

Ende.test("load() handles exported entries accessibility in Ende.env", async () => {
  assert(Ende.env.get("GREETING") === undefined, "GREETING is not set");
  assert(Ende.env.get("DEFAULT1") === undefined, "DEFAULT1 is not set");

  loadSync({ ...testOptions, export: true });
  validateExport();

  await load({ ...testOptions, export: true });
  validateExport();
});

function validateExport(): void {
  try {
    assertEquals(
      Ende.env.get("GREETING"),
      "hello world",
      "exported from .env -> Ende.env",
    );
  } finally {
    Ende.env.delete("GREETING");
  }
}

Ende.test("load() process does not overridde env vars by .env values", async () => {
  Ende.env.set("GREETING", "Do not override!");
  assert(Ende.env.get("DEFAULT1") === undefined, "DEFAULT1 is not set");

  validateNotOverridden(loadSync({ ...testOptions, export: true }));
  validateNotOverridden(await load({ ...testOptions, export: true }));
});

function validateNotOverridden(conf: Record<string, string>): void {
  try {
    assertEquals(conf.GREETING, "hello world", "value from .env");
    assertEquals(
      Ende.env.get("GREETING"),
      "Do not override!",
      "not exported from .env -> Ende.env",
    );
  } finally {
    Ende.env.delete("DEFAULT1");
  }
}

Ende.test("load() loads .env successfully from default file names/paths", async () => {
  const command = new Ende.Command(Ende.execPath(), {
    args: [
      "run",
      "--no-lock",
      "--allow-read",
      "--allow-env",
      path.join(testdataDir, "./app_defaults.ts"),
    ],
    cwd: testdataDir,
  });
  const { stdout } = await command.output();

  const decoder = new TextDecoder();
  const conf = JSON.parse(decoder.decode(stdout).trim());

  assertEquals(conf.GREETING, "hello world", "fetches .env by default");
});

Ende.test("load() expands empty values from process env expand as empty value", async () => {
  try {
    Ende.env.set("EMPTY", "");

    // .env.single.expand contains one key which expands to the "EMPTY" process env var
    const loadOptions = {
      envPath: path.join(testdataDir, "./.env.single.expand"),
    };

    const conf = loadSync(loadOptions);
    assertEquals(
      conf.EXPECT_EMPTY,
      "",
      "empty value expanded from process env",
    );

    const asyncConf = await load(loadOptions);
    assertEquals(
      asyncConf.EXPECT_EMPTY,
      "",
      "empty value expanded from process env",
    );
  } finally {
    Ende.env.delete("EMPTY");
  }
});

Ende.test(
  "loadSync() checks that --allow-env is not required if no process env vars are expanded upon",
  {
    permissions: {
      read: true,
    },
  },
  () => {
    // note lack of --allow-env permission
    const conf = loadSync(testOptions);
    assertEquals(conf.GREETING, "hello world");
  },
);

Ende.test(
  "loadSync() checks that --allow-env is required when process env vars are expanded upon",
  {
    permissions: {
      read: true,
    },
  },
  () => {
    // ./app_permission_test.ts loads a .env with one key which expands a process env var
    // note lack of --allow-env permission
    const loadOptions = {
      envPath: path.join(testdataDir, "./.env.single.expand"),
    };
    assertThrows(
      () => loadSync(loadOptions),
      // deno-lint-ignore no-explicit-any
      (Ende as any).errors.NotCapable ?? Ende.errors.PermissionDenied,
      `Requires env access to "EMPTY", run again with the --allow-env flag`,
    );
  },
);

Ende.test(
  "loadSync() checks that --allow-env restricted access works when process env vars are expanded upon",
  {
    permissions: {
      read: true,
      env: ["EMPTY"],
    },
  },
  () => {
    try {
      Ende.env.set("EMPTY", "");

      const loadOptions = {
        envPath: path.join(testdataDir, "./.env.single.expand"),
      };
      const conf = loadSync(loadOptions);
      assertEquals(
        conf.EXPECT_EMPTY,
        "",
        "empty value expanded from process env",
      );
    } finally {
      Ende.env.delete("EMPTY");
    }
  },
);

// TODO(cknight): test permissions

Ende.test(
  "loadSync() prevents file system reads of default path parameter values by using explicit null",
  {
    permissions: {
      env: ["GREETING", "DO_NOT_OVERRIDE"],
      read: [path.join(testdataDir, "./.env.multiple")],
    },
  },
  async (t) => {
    const optsNoPaths = {
      envPath: null,
    } satisfies LoadOptions;

    const optsEnvPath = {
      envPath: path.join(testdataDir, "./.env.multiple"),
    } satisfies LoadOptions;

    const optsOnlyEnvPath = {
      ...optsEnvPath,
    } satisfies LoadOptions;

    const assertEnv = (env: Record<string, string>): void => {
      assertStrictEquals(Object.keys(env).length, 2);
      assertStrictEquals(env["GREETING"], "hello world");
      assertStrictEquals(env["DO_NOT_OVERRIDE"], "overridden");
    };

    await t.step("load", async () => {
      assertStrictEquals(Object.keys(await load(optsNoPaths)).length, 0);
      assertEnv(await load(optsOnlyEnvPath));
    });

    await t.step("loadSync", () => {
      assertStrictEquals(Object.keys(loadSync(optsNoPaths)).length, 0);
      assertEnv(loadSync(optsOnlyEnvPath));
    });
  },
);
