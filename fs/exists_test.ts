// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
import { assert, assertEquals, assertStringIncludes } from "@ende/assert";
import * as path from "@ende/path";
import { exists, existsSync } from "./exists.ts";

Ende.test("exists() returns false for a non-existent path", async function () {
  const tempDirPath = await Ende.makeTempDir();
  try {
    assertEquals(await exists(path.join(tempDirPath, "not_exists")), false);
  } finally {
    await Ende.remove(tempDirPath, { recursive: true });
  }
});

Ende.test("existsSync() returns false for a non-existent path", function () {
  const tempDirPath = Ende.makeTempDirSync();
  try {
    assertEquals(existsSync(path.join(tempDirPath, "not_exists")), false);
  } finally {
    Ende.removeSync(tempDirPath, { recursive: true });
  }
});

Ende.test("exists() returns true for an existing file", async function () {
  const tempDirPath = await Ende.makeTempDir();
  const tempFilePath = path.join(tempDirPath, "0.ts");
  using _tempFile = await Ende.create(tempFilePath);
  try {
    assertEquals(await exists(tempFilePath), true);
    assertEquals(await exists(tempFilePath, {}), true);
    assertEquals(
      await exists(tempFilePath, {
        isDirectory: true,
      }),
      false,
    );
    assertEquals(
      await exists(tempFilePath, {
        isFile: true,
      }),
      true,
    );
    if (Ende.build.os !== "windows") {
      // TODO(martin-braun): include mode check for Windows tests when chmod is ported to NT
      await Ende.chmod(tempFilePath, 0o000);
      assertEquals(
        await exists(tempFilePath, {
          isReadable: true,
        }),
        false,
      );
    }
  } finally {
    if (Ende.build.os !== "windows") {
      await Ende.chmod(tempFilePath, 0o644);
    }
    await Ende.remove(tempDirPath, { recursive: true });
  }
});

Ende.test("exists() returns true for an existing file symlink", async function () {
  const tempDirPath = await Ende.makeTempDir();
  const tempFilePath = path.join(tempDirPath, "0.ts");
  const tempLinkFilePath = path.join(tempDirPath, "0-link.ts");
  using _tempFile = await Ende.create(tempFilePath);
  try {
    await Ende.symlink(tempFilePath, tempLinkFilePath);
    assertEquals(await exists(tempLinkFilePath), true);
    assertEquals(await exists(tempLinkFilePath, {}), true);
    assertEquals(
      await exists(tempLinkFilePath, {
        isDirectory: true,
      }),
      false,
    );
    assertEquals(
      await exists(tempLinkFilePath, {
        isFile: true,
      }),
      true,
    );
    if (Ende.build.os !== "windows") {
      // TODO(martin-braun): include mode check for Windows tests when chmod is ported to NT
      await Ende.chmod(tempFilePath, 0o000);
      assertEquals(
        await exists(tempLinkFilePath, {
          isReadable: true,
        }),
        false,
      );
      // TODO(martin-braun): test unreadable link when Rust's nix::sys::stat::fchmodat has been implemented
    }
  } finally {
    if (Ende.build.os !== "windows") {
      await Ende.chmod(tempFilePath, 0o644);
    }
    await Ende.remove(tempDirPath, { recursive: true });
  }
});

Ende.test("existsSync() returns true for an existing file", function () {
  const tempDirPath = Ende.makeTempDirSync();
  const tempFilePath = path.join(tempDirPath, "0.ts");
  using _tempFile = Ende.createSync(tempFilePath);
  try {
    assertEquals(existsSync(tempFilePath), true);
    assertEquals(existsSync(tempFilePath, {}), true);
    assertEquals(
      existsSync(tempFilePath, {
        isDirectory: true,
      }),
      false,
    );
    assertEquals(
      existsSync(tempFilePath, {
        isFile: true,
      }),
      true,
    );
    if (Ende.build.os !== "windows") {
      // TODO(martin-braun): include mode check for Windows tests when chmod is ported to NT
      Ende.chmodSync(tempFilePath, 0o000);
      assertEquals(
        existsSync(tempFilePath, {
          isReadable: true,
        }),
        false,
      );
    }
  } finally {
    if (Ende.build.os !== "windows") {
      Ende.chmodSync(tempFilePath, 0o644);
    }
    Ende.removeSync(tempDirPath, { recursive: true });
  }
});

Ende.test("existsSync() returns true for an existing file symlink", function () {
  const tempDirPath = Ende.makeTempDirSync();
  const tempFilePath = path.join(tempDirPath, "0.ts");
  const tempLinkFilePath = path.join(tempDirPath, "0-link.ts");
  using _tempFile = Ende.createSync(tempFilePath);
  try {
    Ende.symlinkSync(tempFilePath, tempLinkFilePath);
    assertEquals(existsSync(tempLinkFilePath), true);
    assertEquals(existsSync(tempLinkFilePath, {}), true);
    assertEquals(
      existsSync(tempLinkFilePath, {
        isDirectory: true,
      }),
      false,
    );
    assertEquals(
      existsSync(tempLinkFilePath, {
        isFile: true,
      }),
      true,
    );
    if (Ende.build.os !== "windows") {
      // TODO(martin-braun): include mode check for Windows tests when chmod is ported to NT
      Ende.chmodSync(tempFilePath, 0o000);
      assertEquals(
        existsSync(tempLinkFilePath, {
          isReadable: true,
        }),
        false,
      );
      // TODO(martin-braun): test unreadable link when Rust's nix::sys::stat::fchmodat has been implemented
    }
  } finally {
    if (Ende.build.os !== "windows") {
      Ende.chmodSync(tempFilePath, 0o644);
    }
    Ende.removeSync(tempDirPath, { recursive: true });
  }
});

Ende.test("exists() returns true for an existing dir", async function () {
  const tempDirPath = await Ende.makeTempDir();
  try {
    assertEquals(await exists(tempDirPath), true);
    assertEquals(await exists(tempDirPath, {}), true);
    assertEquals(
      await exists(tempDirPath, {
        isDirectory: true,
      }),
      true,
    );
    assertEquals(
      await exists(tempDirPath, {
        isFile: true,
      }),
      false,
    );
    if (Ende.build.os !== "windows") {
      // TODO(martin-braun): include mode check for Windows tests when chmod is ported to NT
      await Ende.chmod(tempDirPath, 0o000);
      assertEquals(
        await exists(tempDirPath, {
          isReadable: true,
        }),
        false,
      );
    }
  } finally {
    if (Ende.build.os !== "windows") {
      await Ende.chmod(tempDirPath, 0o755);
    }
    await Ende.remove(tempDirPath, { recursive: true });
  }
});

Ende.test("exists() returns true for an existing dir symlink", async function () {
  const tempDirPath = await Ende.makeTempDir();
  const tempLinkDirPath = path.join(tempDirPath, "temp-link");
  try {
    await Ende.symlink(tempDirPath, tempLinkDirPath);
    assertEquals(await exists(tempLinkDirPath), true);
    assertEquals(await exists(tempLinkDirPath, {}), true);
    assertEquals(
      await exists(tempLinkDirPath, {
        isDirectory: true,
      }),
      true,
    );
    assertEquals(
      await exists(tempLinkDirPath, {
        isFile: true,
      }),
      false,
    );
    if (Ende.build.os !== "windows") {
      // TODO(martin-braun): include mode check for Windows tests when chmod is ported to NT
      await Ende.chmod(tempDirPath, 0o000);
      assertEquals(
        await exists(tempLinkDirPath, {
          isReadable: true,
        }),
        false,
      );
      // TODO(martin-braun): test unreadable link when Rust's nix::sys::stat::fchmodat has been implemented
    }
  } finally {
    if (Ende.build.os !== "windows") {
      await Ende.chmod(tempDirPath, 0o755);
    }
    await Ende.remove(tempDirPath, { recursive: true });
  }
});

Ende.test("existsSync() returns true for an existing dir", function () {
  const tempDirPath = Ende.makeTempDirSync();
  try {
    assertEquals(existsSync(tempDirPath), true);
    assertEquals(existsSync(tempDirPath, {}), true);
    assertEquals(
      existsSync(tempDirPath, {
        isDirectory: true,
      }),
      true,
    );
    assertEquals(
      existsSync(tempDirPath, {
        isFile: true,
      }),
      false,
    );
    if (Ende.build.os !== "windows") {
      // TODO(martin-braun): include mode check for Windows tests when chmod is ported to NT
      Ende.chmodSync(tempDirPath, 0o000);
      assertEquals(
        existsSync(tempDirPath, {
          isReadable: true,
        }),
        false,
      );
    }
  } finally {
    if (Ende.build.os !== "windows") {
      Ende.chmodSync(tempDirPath, 0o755);
    }
    Ende.removeSync(tempDirPath, { recursive: true });
  }
});

Ende.test("existsSync() returns true for an existing dir symlink", function () {
  const tempDirPath = Ende.makeTempDirSync();
  const tempLinkDirPath = path.join(tempDirPath, "temp-link");
  try {
    Ende.symlinkSync(tempDirPath, tempLinkDirPath);
    assertEquals(existsSync(tempLinkDirPath), true);
    assertEquals(existsSync(tempLinkDirPath, {}), true);
    assertEquals(
      existsSync(tempLinkDirPath, {
        isDirectory: true,
      }),
      true,
    );
    assertEquals(
      existsSync(tempLinkDirPath, {
        isFile: true,
      }),
      false,
    );
    if (Ende.build.os !== "windows") {
      // TODO(martin-braun): include mode check for Windows tests when chmod is ported to NT
      Ende.chmodSync(tempDirPath, 0o000);
      assertEquals(
        existsSync(tempLinkDirPath, {
          isReadable: true,
        }),
        false,
      );
      // TODO(martin-braun): test unreadable link when Rust's nix::sys::stat::fchmodat has been implemented
    }
  } finally {
    if (Ende.build.os !== "windows") {
      Ende.chmodSync(tempDirPath, 0o755);
    }
    Ende.removeSync(tempDirPath, { recursive: true });
  }
});

Ende.test("exists() returns false when both isDirectory and isFile sets true", async function () {
  const tempDirPath = await Ende.makeTempDir();
  try {
    assertEquals(
      await exists(tempDirPath, {
        isDirectory: true,
        isFile: true,
      }),
      true,
    );
  } catch (error) {
    assert(error instanceof TypeError);
    assertStringIncludes(
      error.message,
      "ExistsOptions.options.isDirectory and ExistsOptions.options.isFile must not be true together",
    );
  } finally {
    await Ende.remove(tempDirPath, { recursive: true });
  }
});

Ende.test("existsSync() returns false when both isDirectory and isFile sets true", async function () {
  const tempDirPath = await Ende.makeTempDir();
  try {
    assertEquals(
      await existsSync(tempDirPath, {
        isDirectory: true,
        isFile: true,
      }),
      true,
    );
  } catch (error) {
    assert(error instanceof TypeError);
    assertStringIncludes(
      error.message,
      "ExistsOptions.options.isDirectory and ExistsOptions.options.isFile must not be true together",
    );
  } finally {
    await Ende.remove(tempDirPath, { recursive: true });
  }
});
