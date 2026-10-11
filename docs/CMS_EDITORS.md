# CMS editor options

The admin page editor now offers TipTap, CKEditor 5, Puck, TinaCMS, and Storyblok. The editor can be chosen per editing session; **Site Settings → Default page editor** controls the initial choice. Switching an existing page between Puck and the local rich-text editors converts the content for editing while retaining the existing blocks and HTML. Switching a Storyblok-backed page to a local editor first loads its current Storyblok draft through the authenticated server route; a failed load leaves the remote reference unchanged.

## Persistence model

There is no new Prisma content table or parallel local content store. TipTap, CKEditor 5, Puck, and TinaCMS save into the existing `Page.content` field. TipTap, CKEditor, and TinaCMS continue to use HTML; Puck stores a versioned JSON document in that same string field and the public renderer recognizes it. Existing HTML pages remain unchanged until an administrator edits/saves them in a different format. TinaCMS is used as an embedded form/editor toolkit with a custom callback to the existing page API; this project does not enable TinaCloud or create Git-backed Tina content files.

When Storyblok is selected, the page body is saved to a Storyblok story and Prisma stores only a versioned reference in `Page.content`. Public slug pages fetch the **published** Storyblok body. Draft saves do not replace the published version on the public site. The Prisma page record remains authoritative for the route, title, navigation, status, and metadata.

## Storyblok deployment setup

Set these variables in the server deployment environment (never put management tokens in client code or database settings):

| Variable | Purpose |
| --- | --- |
| `STORYBLOK_SPACE_ID` | Numeric ID of the Storyblok space |
| `STORYBLOK_MANAGEMENT_TOKEN` | Server-only token with permission to create/update stories |
| `STORYBLOK_PUBLIC_ACCESS_TOKEN` | Delivery token used by public pages for published story reads |
| `STORYBLOK_REGION` | Optional region (`eu`, `us`, `ap`, `ca`, or `cn`); defaults to `eu` |
| `STORYBLOK_PAGE_COMPONENT` | Optional story component name; defaults to `page` |
| `STORYBLOK_PAGE_HTML_FIELD` | Optional text/textarea field name; defaults to `html_content` |

The Storyblok space must have the configured content-type component (default `page`) and a string/text field (default `html_content`). The integration writes the page body's HTML into that field. The connection status in the Storyblok editor reports missing required environment variable **names only**, never secret values. Pages using Storyblok require the public access token to be set so the public route can render them.

## CKEditor 5

CKEditor 5 is now the modular current package, not the deprecated Classic Build. It enables heading, bold/italic/underline, links, ordered/bulleted lists, block quotes, tables, image insertion/upload, media embeds, code blocks, alignment, and undo/redo. Image uploads use the existing authenticated `/api/media` endpoint, which stores in the project's existing Supabase media storage and returns the public URL.

If using a commercial CKEditor license, set `NEXT_PUBLIC_CKEDITOR_LICENSE_KEY` at build time. Otherwise the editor uses CKEditor's `GPL` license mode; only deploy that mode if the application meets CKEditor's GPL terms. CKEditor errors are isolated to that mode, and TipTap remains available as a fallback. The modular CKEditor dependency tree is deduplicated; `npm run test:ckeditor-runtime` imports and initializes the configured plugin set to catch duplicate-module regressions.

## Puck blocks

The Puck builder includes headings, TipTap-backed rich text, legacy HTML, images/captions, and link buttons. Its saved document is versioned and rendered by the public content renderer. When switching to a local HTML editor, the supported blocks are converted to HTML. When switching from legacy HTML into Puck, the HTML is retained as a legacy HTML block.

## Permissions and checks

Page-editor API reads/writes, media upload/list, faculty create/update/delete, and image-placeholder writes are admin-only. Faculty photo uploads reuse the existing `Faculty.photoUrl` field and authenticated media storage; the public faculty page reads that same field. Faculty and placeholder URL writes accept only HTTP(S) or same-site paths. Storyblok tokens are only used in server routes/server rendering, and fetched Storyblok HTML is sanitized (scripts/event handlers and unapproved iframe hosts are removed; YouTube/Vimeo embeds remain allowed). No schema migration is required for the editor formats or the already-present `Faculty.photoUrl` field. To verify after deployment: open an existing page in each editor, edit and save, reload the admin page, then visit the public slug; for Storyblok, test both draft (public stays published) and published saves. The development checkout used for implementation has no database or Storyblok credentials, so live database/remote-provider writes must be smoke-tested in the configured deployment after setting the listed credentials.
