// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
// Copyright the Browserify authors. MIT License.
// Ported from https://github.com/browserify/path-browserify/
import { assertEquals } from "@ende/assert";
import * as posix from "./posix/mod.ts";
import * as windows from "./windows/mod.ts";
import { resolve } from "./resolve.ts";

const windowsTests =
  // arguments                               result
  [
    [["c:/blah\\blah", "d:/games", "c:../a"], "c:\\blah\\a"],
    [["c:/ignore", "d:\\a/b\\c/d", "\\e.exe"], "d:\\e.exe"],
    [["c:/ignore", "c:/some/file"], "c:\\some\\file"],
    [["d:/ignore", "d:some/dir//"], "d:\\ignore\\some\\dir"],
    [["//server/share", "..", "relative\\"], "\\\\server\\share\\relative"],
    [["c:/", "//"], "c:\\"],
    [["c:/", "//dir"], "c:\\dir"],
    [["c:/", "//server/share"], "\\\\server\\share\\"],
    [["c:/", "//server//share"], "\\\\server\\share\\"],
    [["c:/", "///some//dir"], "c:\\some\\dir"],
    [
      ["C:\\foo\\tmp.3\\", "..\\tmp.3\\cycles\\root.js"],
      "C:\\foo\\tmp.3\\cycles\\root.js"
    ]
  ];
const posixTests =
  // arguments                    result
  [
    [["/var/lib", "../", "file/"], "/var/file"],
    [["/var/lib", "/../", "file/"], "/file"],
    [["a/b/c/", "../../.."], Ende.cwd()],
    [["."], Ende.cwd()],
    [["/some/dir", ".", "/absolute/"], "/absolute"],
    [["/foo/tmp.3/", "../tmp.3/cycles/root.js"], "/foo/tmp.3/cycles/root.js"]
  ];

Ende.test("posix.resolve()", function() {
  posixTests.forEach(function(p) {
    const _p = p[0] as string[];
    const actual = posix.resolve.apply(null, _p);
    assertEquals(actual, p[1]);
  });
});

Ende.test("windows.resolve()", function() {
  windowsTests.forEach(function(p) {
    const _p = p[0] as string[];
    const actual = windows.resolve.apply(null, _p);
    assertEquals(actual, p[1]);
  });
});

Ende.test("resolve() returns current working directory if input is empty", function() {
  const pwd = Ende.cwd();
  assertEquals(resolve(""), pwd);
  assertEquals(resolve("", ""), pwd);
});
