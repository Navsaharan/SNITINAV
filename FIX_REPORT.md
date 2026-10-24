# SNITINAV Fix Report

Date: 2026-10-25
Repository: `Navsaharan/SNITINAV`
Branch: `master`

## Verification summary

The exact pushed tree passes:

- `npm run test:all` — passed: TypeScript, 5 Jest suites / 14 tests, CMS sanitization smoke test, and CKEditor runtime smoke test.
- `npm run build` — passed: Next.js production build, 59 static pages generated, route collection and type validation completed.
- `npm run type-check` — passed.
- `node --check scripts/setup-supabase.js` — passed.
- `npm run env:validate` — correctly fails when `DATABASE_URL` and `NEXTAUTH_SECRET` are absent from this sandbox.
- `npm run migrate:validate` — correctly fails because the existing migration lock is not PostgreSQL-compatible; this remains approval-blocked.
- Lint completes with warnings only; the repository has substantial pre-existing unused-variable, explicit-`any`, hook-dependency, and `<img>` warnings. Build currently skips linting.

No Supabase or real database was accessed or modified. No migration, RLS policy, schema, storage policy, or data script was executed.

## Fix table

| Item | Status | Files / checkpoint | Tests and evidence |
|---|---|---|---|
| CMS styling lost on slug pages | **FIX VERIFIED** | `src/components/admin/tiptap-editor.tsx`, `src/lib/sanitize-page-html.ts`, `src/components/content/content-renderer.tsx`, `src/lib/puck-page-config.tsx`, `scripts/test-cms-sanitization.ts`; commit `a6a813b` | Root cause confirmed: TipTap had no Color, Highlight, or FontSize marks/controls; render sinks bypassed sanitization. Added safe TipTap controls, validated style properties, and render-time sanitization. CMS smoke test and final build pass. Authenticated browser round-trip is not verified. |
| BUG-001/002/003/004 authorization | **FIX VERIFIED** | `src/lib/security.ts`, `src/lib/secure-api.ts`, protected content/contact/dashboard/settings routes, `src/lib/security.test.ts`; commit `e25efe5` | Central `requireRole()` now returns 401 for anonymous and 403 for insufficient roles. Focused negative tests cover anonymous, VIEWER, and EDITOR. Public contact POST remains public. |
| BUG-005 stored XSS / unsanitized content writes | **FIX VERIFIED** | Content routes, shared sanitizer, ContentRenderer, Puck config; commits `e25efe5`, `a6a813b` | Content POST/PUT sanitizes at write time; all identified `dangerouslySetInnerHTML` sinks sanitize at render time. Safe-style and malicious-CSS assertions are in `test-cms-sanitization.ts`; smoke test passes. |
| BUG-006 placeholder SVG injection | **FIX VERIFIED** | `src/app/api/placeholder-image/route.ts`, `src/lib/placeholder-image.ts`, `src/lib/placeholder-image.test.ts`; commit `19955fa` | Dimensions are bounded, colors are six-digit hex only, text is XML-escaped and length-limited. Focused tests pass. |
| BUG-007 file/media endpoint safety | **FIX VERIFIED** | `src/app/api/files/[...path]/route.ts`, admin media components; commit `5d12ac9` | Bucket allowlisting, traversal rejection, MIME/size validation, private/no-store behavior, and upload failure reporting were implemented. Media URL/bucket regression tests pass. Live Supabase storage and authenticated upload flows are not verified. |
| BUG-009 hard-coded credentials | **FIX VERIFIED** | `prisma/seed.ts`, `scripts/setup-supabase.js`, `.env.example`, `src/lib/seed-config.test.ts`; commit `45080f5` | Seed and legacy setup now require `SEED_ADMIN_PASSWORD` (minimum 12 chars); embedded Supabase URL and fake hash removed. Static regression test and Node syntax check pass. |
| BUG-017 missing local gates / runtime mismatch | **FIX VERIFIED (local scope)** | `.nvmrc`, `package.json`, `package-lock.json`, `scripts/run-tests.ts`, `scripts/validate-env.ts`, `scripts/validate-migration.ts`, workflow Node pin; commit `5dbfc93` | `npm run test:all` passes. Node 22 is pinned. `env:validate` and `migrate:validate` now exist and fail closed. The workflow still contains stale deployment/Docker references listed below. |
| BUG-008 CSRF binding | **OPEN** | Not changed | Current validation still checks only a 64-hex shape and is not bound to the session or Origin. Requires a dedicated implementation and authenticated client-flow test. |
| BUG-010/011/012/014 migration/provider/RLS/schema issues | **BLOCKED** | Read-only validator added; no DB files changed | Existing migration tree is at root `migrations/`; `prisma/migrations` is absent/ignored; `migration_lock.toml` is not PostgreSQL-compatible; RLS references need catalog comparison. Requires disposable local PostgreSQL test and explicit approval before moving/editing migrations or SQL. |
| BUG-015 navigation model split | **OPEN** | Not changed | `MenuItem` and `NavigationItem` paths both exist. Consolidation requires schema/data migration approval. |
| BUG-016 mock admin-service metrics | **OPEN** | Not changed | `src/lib/admin-service.ts` still contains mock/fallback metrics and needs a scoped Prisma implementation. |
| BUG-018/019/020 stale deployment artifacts | **OPEN / PARTIAL** | Workflow Node pin fixed; stale artifacts not invented | `Dockerfile.production`, `docker-compose.staging.yml`, backup/rollback/smoke/deploy scripts referenced by workflow are missing. Deployment was not run. |
| BUG-030/023 dependency advisories and peer conflict | **OPEN** | Not changed | `npm ci` completed but reports 86 advisories, including 6 critical, and the TinaCMS/React 19 peer conflict. Upgrading requires compatibility testing and a separate dependency plan. |
| BUG-021/022/024/025 dead links, Sanity preview, docs/registry, public settings/health | **OPEN** | Not changed | Requires route-by-route product decisions and authenticated/public contract tests. `/api/settings/public` and `/api/health` need a separate response-surface review. |
| BUG-027 database FKs/hierarchy policy/indexes | **BLOCKED** | Not changed | New migration required; must follow the database approval and disposable-Postgres rule. |
| BUG-013 media/Supabase atomicity | **BLOCKED** | Not changed | Requires compensation/idempotency/reconciliation design and likely storage/database behavior verification. |
| BUG-026 rate limiter/proxy/header hardening | **OPEN** | Not changed | Current limiter is process-local and trusts the first forwarded IP. Distributed storage and trusted proxy configuration need an infrastructure decision. |
| BUG-028/029 slideshow/slug metadata/errors | **OPEN** | Not changed | Slideshow JSON validation, metadata DB error handling, and typed inline error UX remain. |

## Root-cause notes for CMS styling

The write path for pages already called `sanitizePageHtml`, but the sanitizer’s style allowlist did not cover the full editor needs, and ContentRenderer/Puck raw HTML sinks rendered unsanitized content. TipTap only configured basic marks, alignment, tables, links, and images; it did not configure Color, Highlight, TextStyle/FontSize, or corresponding controls. CKEditor already included Font, FontSize, FontColor, FontBackgroundColor, and GeneralHtmlSupport. The fix adds equivalent safe TipTap capabilities and applies the same validated sanitizer at write and render boundaries.

## Blocked database/Supabase work awaiting explicit approval

No SQL or migration was run. The following proposed work is awaiting approval:

1. Reconcile root `migrations/` versus the ignored `prisma/migrations/` path and choose the single source of truth.
2. Reconcile `migration_lock.toml` with PostgreSQL and test `prisma migrate deploy` against an empty disposable local PostgreSQL database.
3. Compare the RLS migration’s `public.system_alerts` reference against the live catalog and Prisma schema; decide whether the table/policies should exist.
4. Decide whether and how to add the requested foreign keys, indexes, page-cycle/delete policy, and media compensation/reconciliation behavior.
5. Review stale setup SQL/schema files and determine whether they should be retired, regenerated, or replaced.

Before any approval request, the exact SQL, affected objects, risks, rollback, and disposable-Postgres output must be shown. No existing rows should be modified.

## Secrets to rotate / purge

Rotate these outside the repository and deployment environment:

- Any Supabase/PostgreSQL password that appeared in the old `scripts/setup-supabase.js` URL.
- Any administrator password created from the old `admin123` seed value or the old setup-script fake/default hash.
- `NEXTAUTH_SECRET` if it was ever reused, weak, or committed elsewhere.
- Supabase service-role and anon keys if they were exposed in repository history, logs, screenshots, or CI output.
- Any GitHub, Vercel, SSH, Slack, or deployment credentials referenced by the workflow if they were exposed.

The repository history was not rewritten. To purge exposed values, rotate/revoke them first, then use an approved repository-history rewrite tool/process, force-push with team coordination, and verify forks, CI logs, caches, and deployment environments.

## Decisions needed

1. Approve or reject the migration/RLS/schema reconciliation plan above.
2. Confirm the canonical navigation model (`NavigationItem`) and the data migration policy for legacy `MenuItem` rows.
3. Choose whether the application should use a managed/Vercel deployment path or repair the legacy Docker/SSH deployment workflow.
4. Choose the supported dependency/runtime matrix, especially TinaCMS versus React 19 and the 86 npm audit advisories.
5. Confirm which public routes and redirects should exist for the dead-link list.
6. Provide an authenticated staging URL/test account or approve a disposable local test environment for Playwright CRUD/editor-flow verification.

## GitHub checkpoints

- `cb08d1d` — public faculty/gallery media URL resolution
- `5d12ac9` — file access and upload failure hardening
- `e25efe5` — protected API role enforcement and content-write sanitization
- `19955fa` — placeholder SVG parameter validation
- `45080f5` — environment-required bootstrap credentials
- `5dbfc93` — validation gates and Node runtime pin
- `a6a813b` — CMS style preservation and render-sink sanitization
