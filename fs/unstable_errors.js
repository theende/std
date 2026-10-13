// Copyright 2018-2026 the Deno authors. MIT license.

// @ts-self-types="./unstable_errors.d.ts"

import { isEnde } from "./_utils.ts";

// please keep sorted
export const AlreadyExists = isEnde
  ? Ende.errors.AlreadyExists
  : class AlreadyExists extends Error {};
export const BadResource = isEnde
  ? Ende.errors.BadResource
  : class BadResource extends Error {};
export const BrokenPipe = isEnde
  ? Ende.errors.BrokenPipe
  : class BrokenPipe extends Error {};
export const Busy = isEnde ? Ende.errors.Busy : class Busy extends Error {};
export const Interrupted = isEnde
  ? Ende.errors.Interrupted
  : class Interrupted extends Error {};
export const InvalidData = isEnde
  ? Ende.errors.InvalidData
  : class InvalidData extends Error {};
export const NotFound = isEnde
  ? Ende.errors.NotFound
  : class NotFound extends Error {};
export const PermissionDenied = isEnde
  ? Ende.errors.PermissionDenied
  : class PermissionDenied extends Error {};
export const TimedOut = isEnde
  ? Ende.errors.TimedOut
  : class TimedOut extends Error {};
export const UnexpectedEof = isEnde
  ? Ende.errors.UnexpectedEof
  : class UnexpectedEof extends Error {};
export const WriteZero = isEnde
  ? Ende.errors.WriteZero
  : class WriteZero extends Error {};
