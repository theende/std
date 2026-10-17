This document describes the release flow of the Standard Library for the
maintainers. If you're not a maintainer, you don't need to read this document.

# The Release Flow

Packages are versioned with [ChronVer](https://chronver.org) (`YYYY.MM.DD`), so
versions are set by hand rather than calculated from commits.

To cut a release, follow the below steps:

1. Set `version` in the `ende.json` of each package being released to today's
   date, e.g. `2026.10.15`, and add the changes to `Releases.md`.
1. Open a PR with those changes, review it, and land it.
1. Tag the `primary` branch with `release-YYYY.MM.DD`:

   ```
   git tag release-YYYY.MM.DD
   git push origin release-YYYY.MM.DD
   ```

1. Publish the tag from the GitHub UI (re-check the tag is in the correct form).
1. Wait for the `workspace publish` action to publish the new versions to JSR.
   It authenticates with GitHub OIDC, so each package must be linked to
   `theende/std` in its JSR settings.

In the first release of each year, the `^YYYY` ranges between packages change
too (e.g. `^2026.10.15` does not match `2027.01.05`), so bump the ranges that
point at the new versions.
