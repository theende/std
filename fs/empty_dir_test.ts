// Copyright 2018-2026 the Deno authors. MIT license.
import {
  assertEquals,
  assertRejects,
  assertStringIncludes,
  assertThrows,
} from "@ende/assert";
import * as path from "@ende/path";
import { emptyDir, emptyDirSync } from "./empty_dir.ts";

Ende.test("emptyDir() creates a new dir if it does not exist", async function () {
  const tempDirPath = await Ende.makeTempDir({ prefix: "ende_std_empty_dir_" });
  const testDir = path.join(tempDirPath, "empty_dir_test_1");
  const testNestDir = path.join(testDir, "nest");
  // empty a dir which not exist. then it will create new one
  await emptyDir(testNestDir);

  try {
    // check the dir
    const stat = await Ende.stat(testNestDir);
    assertEquals(stat.isDirectory, true);
  } finally {
    // Cleanup and remove test directories.
    await Ende.remove(tempDirPath, { recursive: true });
  }
});

Ende.test("emptyDirSync() creates a new dir if it does not exist", function () {
  const tempDirPath = Ende.makeTempDirSync({
    prefix: "ende_std_empty_dir_sync_",
  });
  const testDir = path.join(tempDirPath, "empty_dir_test_2");
  const testNestDir = path.join(testDir, "nest");
  // empty a dir which does not exist, then it will a create new one.
  emptyDirSync(testNestDir);

  try {
    // check the dir
    const stat = Ende.statSync(testNestDir);
    assertEquals(stat.isDirectory, true);
  } finally {
    // Cleanup and remove test directories.
    Ende.removeSync(tempDirPath, { recursive: true });
  }
});

Ende.test("emptyDir() empties nested dirs and files", async function () {
  const tempDirPath = await Ende.makeTempDir({ prefix: "ende_std_empty_dir_" });
  const testDir = path.join(tempDirPath, "empty_dir_test_3");
  const testNestDir = path.join(testDir, "nest");
  // create test dir
  await emptyDir(testNestDir);
  const testDirFile = path.join(testNestDir, "test.ts");
  // create test file in test dir
  await Ende.writeFile(testDirFile, new Uint8Array());

  // before empty: make sure file/directory exist
  const beforeFileStat = await Ende.stat(testDirFile);
  assertEquals(beforeFileStat.isFile, true);

  const beforeDirStat = await Ende.stat(testNestDir);
  assertEquals(beforeDirStat.isDirectory, true);

  await emptyDir(testDir);

  // after empty: file/directory have already been removed
  try {
    // test dir still there
    const stat = await Ende.stat(testDir);
    assertEquals(stat.isDirectory, true);

    // nest directory have been removed
    await assertRejects(
      async () => {
        await Ende.stat(testNestDir);
      },
    );

    // test file have been removed
    await assertRejects(
      async () => {
        await Ende.stat(testDirFile);
      },
    );
  } finally {
    // Cleanup and remove test directory.
    await Ende.remove(tempDirPath, { recursive: true });
  }
});

Ende.test("emptyDirSync() empties nested dirs and files", function () {
  const tempDirPath = Ende.makeTempDirSync({
    prefix: "ende_std_empty_dir_sync_",
  });
  const testDir = path.join(tempDirPath, "empty_dir_test_4");
  const testNestDir = path.join(testDir, "nest");
  // create test dir
  emptyDirSync(testNestDir);
  const testDirFile = path.join(testNestDir, "test.ts");
  // create test file in test dir
  Ende.writeFileSync(testDirFile, new Uint8Array());

  // before empty: make sure file/directory exist
  const beforeFileStat = Ende.statSync(testDirFile);
  assertEquals(beforeFileStat.isFile, true);

  const beforeDirStat = Ende.statSync(testNestDir);
  assertEquals(beforeDirStat.isDirectory, true);

  emptyDirSync(testDir);

  // after empty: file/directory have already remove
  try {
    // test dir still present
    const stat = Ende.statSync(testDir);
    assertEquals(stat.isDirectory, true);

    // nest directory have been removed
    assertThrows(() => {
      Ende.statSync(testNestDir);
    });

    // test file have been removed
    assertThrows(() => {
      Ende.statSync(testDirFile);
    });
  } finally {
    // Cleanup and remove test directory.
    Ende.removeSync(tempDirPath, { recursive: true });
  }
});

// Testing the permissions of emptyDir and emptyDirSync functions in a script
// that is running inside an Ende child process.
const testdataDir = path.join(import.meta.dirname!, "testdata");
interface Scenes {
  read: boolean; // --allow-read
  write: boolean; // --allow-write
  async: boolean;
  output: string;
}
const scenes: Scenes[] = [
  // 1
  {
    read: false,
    write: false,
    async: true,
    output: "run again with the --allow-read flag",
  },
  {
    read: false,
    write: false,
    async: false,
    output: "run again with the --allow-read flag",
  },
  // 2
  {
    read: true,
    write: false,
    async: true,
    output: "run again with the --allow-write flag",
  },
  {
    read: true,
    write: false,
    async: false,
    output: "run again with the --allow-write flag",
  },
  // 3
  {
    read: false,
    write: true,
    async: true,
    output: "run again with the --allow-read flag",
  },
  {
    read: false,
    write: true,
    async: false,
    output: "run again with the --allow-read flag",
  },
  // 4
  {
    read: true,
    write: true,
    async: true,
    output: "success",
  },
  {
    read: true,
    write: true,
    async: false,
    output: "success",
  },
];
for (const s of scenes) {
  let title = `${s.async ? "emptyDir()" : "emptyDirSync()"}`;
  title += ` test ("testdata/testfolder") ${s.read ? "with" : "without"}`;
  title += ` --allow-read & ${s.write ? "with" : "without"} --allow-write`;
  Ende.test(`${title} permission`, async function (): Promise<
    void
  > {
    const tempDirPath = await Ende.makeTempDir({
      prefix: "ende_std_empty_dir_permissions_",
    });
    try {
      const testfolder = path.join(tempDirPath, "testfolder");
      await Ende.mkdir(testfolder);

      await Ende.writeTextFile(
        path.join(testfolder, "child.txt"),
        "hello world",
      );

      try {
        const args = [
          "run",
          "--no-lock",
          "--quiet",
          "--no-prompt",
        ];

        if (s.read) {
          args.push("--allow-read");
        }

        if (s.write) {
          args.push("--allow-write");
        }

        args.push(
          path.join(
            testdataDir,
            s.async ? "empty_dir.ts" : "empty_dir_sync.ts",
          ),
        );

        // Passing the testfolder path as an argument to empty_dir.ts and
        // empty_dir_sync.ts scripts.
        args.push(testfolder);

        const command = new Ende.Command(Ende.execPath(), {
          args,
          stderr: "inherit",
        });
        const { stdout } = await command.output();
        assertStringIncludes(new TextDecoder().decode(stdout), s.output);
      } catch (err) {
        // deno-lint-ignore no-console
        console.log(err);
        await Ende.remove(tempDirPath, { recursive: true });
        throw err;
      }
    } finally {
      // Make the test rerunnable
      // Otherwise it would throw an error due to mkdir fail.
      await Ende.remove(tempDirPath, { recursive: true });
      // done
    }
  });
}
