// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
// This module is browser compatible.

import { checkWindows } from "./_os.ts";

/** Whether the current platform is Windows */
export const isWindows: boolean = checkWindows();
