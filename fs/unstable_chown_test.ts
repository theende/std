// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.

import { assertRejects, assertThrows } from "@ende/assert";
import { chown, chownSync } from "./unstable_chown.ts";
import { NotFound } from "./unstable_errors.js";
import { makeTempFile, makeTempFileSync } from "./unstable_make_temp_file.ts";
import { remove, removeSync } from "./unstable_remove.ts";

function getUidAndGid(): { uid: number; gid: number } {
  return { uid: Ende.uid()!, gid: Ende.gid()! };
}

Ende.test({
  name: "chown() changes user and group ids",
  ignore: Ende.build.os === "windows",
  fn: async () => {
    const { uid, gid } = getUidAndGid();
    const tempFile = await makeTempFile({ prefix: "chown_" });

    // `chown` needs elevated privileges to change to different UIDs and GIDs.
    // Instead, pass the same IDs back to invoke `chown` and avoid erroring.
    await chown(tempFile, uid, gid);
    await remove(tempFile);
  },
});

Ende.test({
  name: "chown() handles `null` id arguments",
  ignore: Ende.build.os === "windows",
  fn: async () => {
    const { uid, gid } = getUidAndGid();
    const tempFile = await makeTempFile({ prefix: "chown_" });

    await chown(tempFile, uid, null);
    await chown(tempFile, null, gid);
    await remove(tempFile);
  },
});

Ende.test({
  name: "chown() rejects with NotFound for a non-existent file",
  ignore: Ende.build.os === "windows",
  fn: async () => {
    await assertRejects(async () => {
      await chown("non-existent-file.txt", null, null);
    }, NotFound);
  },
});

Ende.test({
  name: "chown() rejects with Error when called without elevated privileges",
  ignore: Ende.build.os === "windows",
  fn: async () => {
    const tempFile = await makeTempFile({ prefix: "chown_" });

    await assertRejects(async () => {
      await chown(tempFile, 0, 0);
    }, Error);

    await remove(tempFile);
  },
});

Ende.test({
  name: "chownSync() changes user and group ids",
  ignore: Ende.build.os === "windows",
  fn: () => {
    const { uid, gid } = getUidAndGid();
    const tempFile = makeTempFileSync({ prefix: "chownSync_ " });

    // `chownSync` needs elevated privileges to change to different UIDs and
    // GIDs. Instead, pass the same IDs back to invoke `chownSync` and avoid
    // erroring.
    chownSync(tempFile, uid, gid);
    removeSync(tempFile);
  },
});

Ende.test({
  name: "chownSync() handles `null` id arguments",
  ignore: Ende.build.os === "windows",
  fn: () => {
    const { uid, gid } = getUidAndGid();
    const tempFile = makeTempFileSync({ prefix: "chownSync_" });

    chownSync(tempFile, uid, null);
    chownSync(tempFile, null, gid);
    removeSync(tempFile);
  },
});

Ende.test({
  name: "chownSync() throws with NotFound for a non-existent file",
  ignore: Ende.build.os === "windows",
  fn: () => {
    assertThrows(() => {
      chownSync("non-existent-file.txt", null, null);
    }, NotFound);
  },
});

Ende.test({
  name: "chownSync() throws with Error when called without elevated privileges",
  ignore: Ende.build.os === "windows",
  fn: () => {
    const tempFile = makeTempFileSync({ prefix: "chownSync_" });

    assertThrows(() => {
      chownSync(tempFile, 0, 0);
    }, Error);

    removeSync(tempFile);
  },
});
