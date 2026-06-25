# back-dev-guide: Foundation Design

## Context

Sibling project to `web-dev-guide` (interactive animated learning guide for frontend dev).
`web-dev-guide` already covers HTML/CSS/JS/TS/React/Next.js/Git/HTTP/basic PostgreSQL,
sourced from WBS Coding School live-session notes (`wbs_data/` in that repo).

This project covers the backend portion of the same WBS curriculum, which spans three
distinct tech stacks across the syllabus:

| Phase | Curriculum chapters | Stack | Notes |
|---|---|---|---|
| 0 | (bridge, not a WBS chapter) | JS/TS/Zod crash course | Self-contained; curated subset of core-language topics only, no browser/DOM/React-specific material (that stays exclusive to web-dev-guide) |
| 1 | Ch. 19-21 (+22 optional) | Node.js/TS: MongoDB, Express.js, Zod, custom Auth, (Gen AI/MCP) | First content phase, spec'd separately after this Foundation |
| 2 | Ch. 5 | Python/Flask + SQL | Largely reuses concepts already visualized in web-dev-guide's `postgresql` topic category |
| 3 | Ch. 23-24 | C#/.NET: ASP.NET Minimal APIs, Entity Framework, Identity | No WebContainers support (Node-only runtime) — needs its own execution strategy |
| 4 | Ch. 25 | Azure AZ-900 | Cert-prep style, not hands-on code — likely quiz/flashcard format, different interaction pattern |

This document specs **only the Foundation**: the platform all five phases will sit on top
of. Phase content (starting with Phase 0+1) gets its own design doc once this is built.

## Decisions made during brainstorming

- New, independent repo: `back-dev-guide` (this repo), not a category inside `web-dev-guide`.
- Same frontend stack as web-dev-guide for visual/stylistic consistency and to reuse the
  Viz-component pattern for concept explanations.
- Real in-browser code execution via StackBlitz WebContainers (not TutorialKit) — chosen
  over the ready-made TutorialKit framework specifically because the planned Notes feature
  (per-user, per-topic) needs an auth+data layer that fits naturally on Supabase + a custom
  React app, and doesn't fit TutorialKit's static-site/Astro model.
- New, separate Supabase project — not shared with web-dev-guide's. Decouples the two repos;
  a user logs into each guide independently.
- English only, no i18n overlay for now (web-dev-guide's en/de overlay pattern can be
  retrofitted later if content stabilizes).

## Architecture

- **Stack**: React 19 + TypeScript + Vite 7 + Tailwind CSS 4 + Framer Motion. Same ESLint
  setup as web-dev-guide (`eslint-plugin-react-hooks` v7 React Compiler rules — `set-state-in-effect`
  errors, render-phase-reset pattern preferred: `const [prev, setPrev] = useState(x); if (prev !== x) {...}`).
- **Code execution**: `@webcontainer/api` integrated directly (no TutorialKit). Requires
  `Cross-Origin-Embedder-Policy: require-corp` and `Cross-Origin-Opener-Policy: same-origin`
  response headers — must be configured both in Vite's dev server config and in production
  hosting (VPS reverse proxy / static file server), since WebContainers needs `SharedArrayBuffer`
  and therefore cross-origin isolation.
- **Editor/terminal**: Monaco editor (`@monaco-editor/react`, already proven in web-dev-guide)
  for code editing, writing into the WebContainer's filesystem; xterm.js for terminal output —
  the standard pairing StackBlitz itself uses.
- **Content model**: topic-registry pattern ported from web-dev-guide (typed topic data +
  lazily-loaded Viz components for concept pages), but navigation is phase/sequence-based
  (Phase 0 → 4) rather than category-browsable, since this content is curriculum-ordered.
- **Backend/data**: new Supabase project — Postgres + Auth + (later) Storage if needed.

## Components

1. **Topic Registry & Content** — concept/explanation pages: typed data + lazy Viz components,
   same authoring pattern as web-dev-guide, English-only (no locale JSON overlay).
2. **Lab Runner** — owns the WebContainer lifecycle: boot once per session (lazy, on first
   lab visit), mount a per-lesson starter file tree, expose Monaco (edit) + xterm.js
   (terminal) + a live preview/fetch panel for hitting the running server.
3. **Auth** — Supabase Auth, three methods: GitHub OAuth, Google OAuth, Email/Password.
   Session via `supabase-js`. Concept pages and labs work fully without login; login only
   gates the Notes feature.
4. **Notes** — one BlockNote (Notion-style block editor) instance per topic, content
   persisted as JSON blocks in a `notes` table (`user_id`, `topic_id`, `content_json`,
   `updated_at`), one row per `(user_id, topic_id)`, debounced autosave (~1s after last edit).
5. **Layout/Navigation** — phase-based nav reflecting the roadmap table above.

## Data Flow

- **Anonymous visitor**: full access to concept pages and labs. Labs are ephemeral and
  client-only — nothing is persisted server-side for unauthenticated use.
- **Authenticated visitor**: same, plus a Notes panel per topic. BlockNote content loads
  from Supabase on topic mount and autosaves on edit via direct `supabase-js` table access.
  Row-Level Security restricts every operation to `auth.uid() = user_id`.
- **WebContainer lifecycle**: one boot per browser session, reused across lab navigations
  within that session (boot is the expensive part — avoid repeating it per lesson).

## Auth & Notes — Security

- Supabase RLS policies on `notes`: `select`/`insert`/`update`/`delete` all require
  `auth.uid() = user_id`.
- OAuth redirect URLs scoped to the back-dev-guide domain only — no shared callback config
  with web-dev-guide's Supabase project.

## Error Handling

- **WebContainers unsupported** (no `SharedArrayBuffer` / cross-origin isolation — older
  browsers, some privacy extensions): feature-detect on mount, fall back to a static
  (non-runnable) code view instead of crashing the Lab Runner UI.
- **Notes autosave failures**: BlockNote keeps its own in-memory document state regardless
  of save outcome (optimistic), with a visible "saving… / saved / failed to save, retrying"
  indicator and retry-with-backoff. Editing is never blocked on save success.

## Testing

- ESLint, same config/rules as web-dev-guide.
- One smoke test for the Lab Runner: boot a WebContainer, run `npm --version`, assert
  output — this is mainly to catch COOP/COEP header regressions in deploy config, the most
  fragile cross-cutting piece of this Foundation.
- Auth/Notes verified manually against a local Supabase instance (`supabase start`) rather
  than a full integration suite, matching the lightweight testing posture of the other
  projects in this workspace (no test suite mandated by convention).

## Explicitly out of scope for this Foundation

- Real-time collaborative note editing (Yjs) — notes are single-user only.
- Actual lesson content for any phase — separate design doc per phase, starting with Phase 0+1.
- C#/.NET or Python code execution in the Lab Runner — WebContainers only supports Node.js;
  Phases 2 and 3 will need their own execution strategy (or none), to be designed when reached.
