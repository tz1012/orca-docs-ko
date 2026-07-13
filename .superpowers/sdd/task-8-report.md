# Task 8 Report: Orchestrate, Validate, and Test the Full Sync

## Status

Complete. Prepare, apply, and check orchestration are implemented with fail-closed staging/promotion, workspace-wide serialization, stable JSON summaries, deterministic integration coverage, an operator README, and a clean Starlight build. All review findings have been remediated and regression-tested.

## Implemented

- `scripts/mirror/prepare.ts`
  - Discovers robots.txt, sitemap, and every docs page through the Task 2 interfaces.
  - Rejects an empty sitemap and rejects page-fetch failure above 20 percent.
  - Extracts source pages, mirrors allowed images into ignored staging, plans changes, and writes translation jobs.
  - Replaces staging and job trees through a rollback-capable rename transaction.
  - Stores the base manifest in the prepared snapshot so apply rejects concurrent/stale preparation.
  - Strictly parses every prepared-snapshot field, rejects non-canonical paths, accounts for every discovered URL, and recomputes the complete change plan before any mutation.
  - Contains every configured write root within the workspace.
- `scripts/mirror/apply.ts`
  - Rejects remaining or invalid jobs and independently validates complete translation files for every active page.
  - Rejects incomplete prepared snapshots and changed base manifests.
  - Builds temporary content, sidebar, translation, asset, and manifest targets.
  - Validates notice metadata, protected translations, Korean coverage, internal links, pending-page links, local assets, and current robots exceptions before promotion.
  - Promotes tracked state with the manifest last and rolls back already-installed targets on failure.
  - Rechecks manifest identity immediately before promotion and verifies staged asset bytes against their declared SHA-256 hashes.
  - Enumerates the complete typed content, translation, and asset trees before promotion. Only regular files and required ancestor directories at exact expected paths are accepted; arbitrary extensions, empty directories, links/junctions, special entries, missing entries, and unreferenced assets fail closed.
  - Checks source-tree entry types before cloning/rendering so an expected output directory replaced by a junction cannot be traversed before rejection. The exact final inventory includes active and pending-removal pages, the Korean 404, the two translation support files, and only manifest-referenced local assets.
  - Prunes only newly empty content/translation ancestor directories after planned page removal so exact directory inventories preserve the two-miss removal lifecycle.
  - Reports incomplete rollback with exact recovery targets/backups; post-commit backup cleanup failures no longer misreport the committed promotion as failed.
- `scripts/mirror/inventory.ts`
  - Provides the shared, platform-portable typed tree inventory used by apply and check.
  - Records the root plus every regular file, directory, symbolic link/junction, device, FIFO, socket, or unknown entry without following links.
  - Compares type and relative path, including required directory ancestors, and reports exact missing and unexpected entries.
- `scripts/mirror/check.ts`
  - Requires active manifest paths to equal the current sitemap and accounts for pending removals separately.
  - Re-extracts live pages and compares source identity, page/segment hashes, sitemap metadata, and exact image source state.
  - Revalidates translations/protected tokens/Korean coverage and requires rendered Markdown to equal committed content.
  - Validates exact typed content, translation, and asset inventories before reading generated state or running the build, including pending translations, internal links (excluding protected code examples), notice metadata, local asset content hashes, and current robots exceptions.
  - Runs `pnpm build` only after structural validation, captures its output to keep CLI stdout stable, and rejects missing-route/page/asset build warnings even when the build exits zero.
  - Structurally parses and validates the 404 YAML frontmatter rather than accepting metadata-shaped text in the Markdown body.
  - Rechecks manifest identity after the build before reporting success.
- Workspace synchronization and retained-page integrity
  - Prepare, apply, and check hold the same exclusive `.mirror/sync.lock` generation namespace for their complete operation.
  - Lock ownership uses a token, PID, hostname, and timestamp. Fully initialized nonempty candidate directories are atomically promoted to `active`; stale reclamation first takes an initialized exclusive transition generation and atomically quarantines the observed generation. Only a parseable, sufficiently old lock belonging to a confirmed-dead local process is deleted. Malformed or legacy locks fail closed for manual recovery.
  - Restore uses nonempty directory rename semantics so a newly installed nonempty active generation cannot be replaced on POSIX or Windows. Ownership mismatches preserve both the new active owner and quarantined predecessor, and release cleanup failures after a successful operation create a `release-warning-*.json` artifact inside the namespace without changing the successful CLI result.
  - Failed owner initialization removes its incomplete unique generation. Configuration paths must be strict workspace descendants with distinct, non-nested lexical and real paths, cannot overlap any part of the lock namespace, must match file/directory roles when present, and cannot escape through a symlink or junction ancestor. The lock namespace's real path must also remain inside the real workspace.
  - Manifest pages persist each segment's protected-token set, Korean-coverage requirement, and fenced-code count, plus the exact rendered Markdown hash. Pending-removal apply/check validation therefore detects translation-policy drift and public-content alteration after the source page disappears.
  - Build validation resolves on the child `close` event after stdout/stderr drain, so a trailing integrity warning cannot escape validation.
- `tests/mirror/integration.test.ts` and `tests/support/factories.ts`
  - Cover partial translation rejection, complete atomic promotion, check/build ordering, empty sitemap preservation, the 20 percent threshold, late-validation rollback, pending removal/link retention, image hash and robots drift, notice drift, clean build-output enforcement, and code-example link exclusion.
- `README.md`
  - Documents purpose, unofficial status, attribution, Pages URL, local commands, initial sync, weekday automation, failure policy, summary keys, and troubleshooting.
- Korean Starlight 404 support
  - Added an attributed Korean `src/content/docs/404.md`.
  - Uses `draft: true` to keep Starlight 0.41.3 from emitting a duplicate catch-all route, while a conditional component hides the misleading draft banner on the dedicated 404 route.
  - Added build regression coverage for the Korean notice and absence of the draft banner.

## TDD / Verification Evidence

- Initial RED: `pnpm exec vitest run tests/mirror/integration.test.ts` failed because `apply.ts` and `prepare.ts` were absent.
- Subsequent RED cases were observed for missing promotion, absent `check.ts`, pending-page links, stale pending robots exceptions, duplicate manifest image state, missing build-warning enforcement, code-example false link detection, and the missing/conflicting 404 entry.
- Review RED cases were observed for snapshot traversal and plan forgery, outside-workspace configuration, swallowed rollback errors, post-commit cleanup misreporting, concurrent operations, stale locks, pending-page token/Korean corruption, staged asset corruption, body-spoofed 404 metadata, and mid-check manifest changes.
- Second-review RED cases were observed for malformed stale-lock deletion, successful-operation release failure, equal/overlapping/wrong-role/junction-escaped configuration, altered pending Markdown, retained fenced-code drift, stale active validation metadata, and a warning written through inherited build output after the parent exited.
- Third-review RED cases were observed for a restore/new-owner interleaving that could clobber on POSIX, incomplete generation initialization, lock-namespace junction escape, and ghost Markdown/translation files copied into staged promotion.
- Final targeted RED cases were observed for ghost MDX routes, arbitrary translation files, empty directories, junction/symlink entries, unreferenced assets during apply and check, missing referenced assets, rendering through an expected output directory replaced by a junction, and empty ancestors left by a planned page removal.
- Focused GREEN: all review regression slices passed after implementation.
- Final quality gate (fresh, sequential PowerShell equivalent of the plan command):
  - `pnpm test` — 12 files, 157 tests passed.
  - `pnpm check` — 0 errors, 0 warnings, 0 hints.
  - `pnpm build` — exit 0, 2 pages built, no missing-entry, route-conflict, link, or asset warnings.
- `git diff --check` passed before final staging.

## Self-review

- Confirmed manifest promotion is last and failures before/within promotion preserve or restore the previous manifest.
- Confirmed plan input is fully validated and independently recomputed before filesystem paths derived from it are used.
- Confirmed prepare/apply/check cannot overlap in one workspace and that check detects out-of-band manifest replacement during its build.
- Confirmed pending-removal translations retain the same protected-token and Korean-coverage enforcement as active translations.
- Confirmed two simultaneous stale-lock contenders cannot both reclaim or run, malformed owner records are never auto-deleted, and release ownership mismatch leaves the successor intact.
- Confirmed rendered-content hashes are recorded only at promotion, then checked for both active and retained content without changing the compact CLI summary contract.
- Confirmed prepare assets never write into the committed public asset tree.
- Confirmed apply validates both active output and retained pending content before promotion.
- Confirmed apply and check enumerate every filesystem entry rather than filtering by extension; expected type/path sets include active and pending pages, translation support files, required directories, and exactly referenced assets.
- Confirmed ghost MDX cannot promote or pass check, arbitrary files and empty directories fail closed, junctions are not followed, unreferenced assets cannot promote or pass check, and missing manifest assets are reported before hashing/build.
- Confirmed the second consecutive sitemap miss still removes the retired page and its now-empty content/translation directories under the exact inventory contract.
- Confirmed all three CLI success paths emit one compact JSON object with exactly: `discovered`, `added`, `updated`, `unchanged`, `pendingRemoval`, `removed`, `translatedSegments`, `localImages`, `remoteImages`.
- Confirmed CLI failures write a concise error to stderr and set exit code 1.
- No known blocking concerns remain. Filesystem-wide multi-target promotion is implemented as ordered atomic renames plus rollback; the manifest is installed last so committed state is never advertised before its dependent files are ready.
