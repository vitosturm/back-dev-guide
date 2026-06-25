# PocketBase Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Tasks 1 and 2 are manual infrastructure/admin-UI work performed by the human operator over SSH and in a browser — do not dispatch them to an implementer subagent.** Only Task 3 (in-repo code) fits the subagent-driven workflow.

**Goal:** Replace the paused Supabase backend with a self-hosted PocketBase instance on the existing `jaywee92.de` VPS, so notes storage and login survive indefinitely (no free-tier auto-pause) and keep working cross-device.

**Architecture:** Three tasks. (1) Install PocketBase as a systemd-managed single binary on the VPS, reachable only on `127.0.0.1:8090`, fronted by a new nginx vhost at `pb.jaywee92.de` (subdomain, not a subpath — PocketBase's own production guide warns subpath routing breaks the bundled Admin UI's asset paths). (2) In the PocketBase Admin UI: create the first superuser, register GitHub + Google as OAuth2 providers, and create a `notes` collection with owner-only API rules. (3) In `back-dev-guide`, swap `@supabase/supabase-js` for the `pocketbase` JS SDK across `src/lib`, `src/contexts`, and `src/components/auth`, keeping the existing `useNotes`/`NotesPanel` call signatures (`userId: string`, `topicId: string`) unchanged so no downstream component needs to change.

**Tech Stack:** PocketBase v0.39.x (Go, single binary, SQLite, runs as systemd service), nginx + certbot (existing on the VPS), `pocketbase` npm package `^0.27.0`, React 19 + TypeScript (existing app).

## Global Constraints

- Repo root: `/home/jaywee92/back-dev-guide` — all paths below are relative to here unless marked as VPS paths.
- VPS domain is `jaywee92.de`. The existing nginx vhost lives at `/etc/nginx/sites-enabled/jaywee92.de.conf` and is certbot-managed; `sudo` is available on the VPS.
- PocketBase gets its own subdomain, `pb.jaywee92.de`, and its own nginx vhost file — the existing `jaywee92.de.conf` is not touched.
- PocketBase binds to `127.0.0.1:8090` only. nginx is the sole public-facing TLS terminator, matching how the rest of the VPS is run.
- PocketBase's default CORS policy allows all origins (`AllowOrigins: ["*"]` unless overridden) — no CORS configuration step is needed for the Vite dev server or the production origin.
- `AuthContext`/`useNotes`/`NotesPanel` public interfaces stay unchanged: `user.id` (string), `useNotes(userId: string, topicId: string)`, `getNote`/`upsertNote(userId: string, topicId: string, ...)`. Only the implementation underneath swaps from Supabase to PocketBase.
- This repo has no test suite. Verification for code changes is `npm run build` (tsc -b + vite build) and `npm run lint`. End-to-end behavior (login, OAuth, note persistence) is verified manually after Tasks 1 and 2 are live — call this out explicitly rather than skipping it.
- Signing up with email/password logs the user in immediately (PocketBase does not require email verification to authenticate unless a collection rule demands `verified = true`, and this collection doesn't). This intentionally drops the old "check your email" step from the Supabase flow — simpler for a single-operator personal project.

---

### Task 1: VPS — install PocketBase as a systemd service behind a new nginx vhost

**This task is manual. Run these commands yourself over SSH on the VPS — do not dispatch to a subagent.**

**Files (on the VPS, not in this repo):**
- Create: `/home/jaywee92/pocketbase/pocketbase` (binary)
- Create: `/etc/systemd/system/pocketbase.service`
- Create: `/etc/nginx/sites-available/pb.jaywee92.de.conf` (symlinked into `sites-enabled`)

- [ ] **Step 1: Download and install the PocketBase binary**

```bash
ssh jaywee92@jaywee92.de
mkdir -p ~/pocketbase && cd ~/pocketbase
# Check https://github.com/pocketbase/pocketbase/releases for a newer tag before running this —
# v0.39.4 was latest as of this plan's writing.
wget https://github.com/pocketbase/pocketbase/releases/download/v0.39.4/pocketbase_0.39.4_linux_amd64.zip
unzip pocketbase_0.39.4_linux_amd64.zip pocketbase
rm pocketbase_0.39.4_linux_amd64.zip
chmod +x pocketbase
./pocketbase --version
```

Expected: prints `0.39.4` (or whichever version you downloaded).

- [ ] **Step 2: Create the systemd unit**

```bash
sudo tee /etc/systemd/system/pocketbase.service > /dev/null <<'EOF'
[Unit]
Description=PocketBase
After=network.target

[Service]
Type=simple
User=jaywee92
Group=jaywee92
LimitNOFILE=4096
WorkingDirectory=/home/jaywee92/pocketbase
ExecStart=/home/jaywee92/pocketbase/pocketbase serve --http=127.0.0.1:8090
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
```

- [ ] **Step 3: Enable and start the service**

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now pocketbase
sudo systemctl status pocketbase --no-pager
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:8090/api/health
```

Expected: `systemctl status` shows `active (running)`; the curl prints `200`.

- [ ] **Step 4: Point DNS at the VPS**

At your DNS provider, add an `A` record: `pb.jaywee92.de` → the VPS's public IP (the same IP `jaywee92.de` already resolves to). DNS propagation can take a few minutes.

- [ ] **Step 5: Create the nginx vhost and request a certificate**

```bash
sudo tee /etc/nginx/sites-available/pb.jaywee92.de.conf > /dev/null <<'EOF'
server {
    server_name pb.jaywee92.de;

    location / {
        proxy_pass http://127.0.0.1:8090;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection '';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 360s;
        client_max_body_size 10M;
    }

    listen 80;
}
EOF
sudo ln -s /etc/nginx/sites-available/pb.jaywee92.de.conf /etc/nginx/sites-enabled/pb.jaywee92.de.conf
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d pb.jaywee92.de
```

`certbot --nginx` rewrites the vhost in place to add the `listen 443 ssl` block, the cert paths, and an HTTP→HTTPS redirect — matching the pattern already used for `jaywee92.de.conf`.

- [ ] **Step 6: Verify from outside the VPS**

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://pb.jaywee92.de/api/health
```

Expected: `200`. Then open `https://pb.jaywee92.de/_/` in a browser — PocketBase will prompt you to create the first superuser account. Create it and keep the credentials; you'll need them for Task 2.

---

### Task 2: PocketBase Admin UI — OAuth providers + `notes` collection

**This task is manual. Perform these steps in the PocketBase Admin UI (`https://pb.jaywee92.de/_/`) and the GitHub/Google developer consoles — do not dispatch to a subagent.**

**Interfaces:**
- Produces: a `notes` base collection with fields `user` (relation → `users`), `topic_id` (text), `content_json` (json), readable/writable only by the owning user — this is what Task 3's `src/lib/notes.ts` talks to.
- Produces: GitHub and Google enabled as OAuth2 providers on the `users` auth collection — this is what Task 3's `AuthModal.tsx` calls via `authWithOAuth2({ provider: 'github' | 'google' })`.

- [ ] **Step 1: Register a GitHub OAuth App**

In GitHub: Settings → Developer settings → OAuth Apps → New OAuth App.
- Homepage URL: `https://jaywee92.de`
- Authorization callback URL: `https://pb.jaywee92.de/api/oauth2-redirect`

Save, then generate a new client secret. Keep the Client ID and Client Secret.

- [ ] **Step 2: Register a Google OAuth Client**

In Google Cloud Console: APIs & Services → Credentials → Create Credentials → OAuth client ID → Web application.
- Authorized redirect URI: `https://pb.jaywee92.de/api/oauth2-redirect`

Save and keep the Client ID and Client Secret. (`/api/oauth2-redirect` is the fixed page PocketBase itself serves to complete the popup-based OAuth2 flow used by the JS SDK's `authWithOAuth2()` helper — both providers use this same callback URL.)

- [ ] **Step 3: Enable both providers in PocketBase**

In the Admin UI: Collections → `users` → Edit collection → Options tab → OAuth2 providers.
- Enable GitHub, paste in the Client ID / Client Secret from Step 1.
- Enable Google, paste in the Client ID / Client Secret from Step 2.

Save the collection.

- [ ] **Step 4: Create the `notes` collection**

Collections → New collection.
- Name: `notes`, Type: `Base`
- Fields:
  - `user` — type `Relation`, related collection `users`, Required, Max select `1`, Cascade delete: on
  - `topic_id` — type `Text`, Required
  - `content_json` — type `JSON`, Required
- Indexes tab — add: `CREATE UNIQUE INDEX idx_notes_user_topic ON notes (user, topic_id)`

- [ ] **Step 5: Set API rules on `notes`**

On the same collection, Rules tab — set List/Search rule, View rule, Create rule, Update rule, and Delete rule all to:

```
@request.auth.id != "" && user = @request.auth.id
```

Save the collection.

- [ ] **Step 6: Verify the rules are active**

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://pb.jaywee92.de/api/collections/notes/records
```

Expected: `403` (unauthenticated requests are rejected by the List rule — proves the rule is live, not left at the permissive default).

---

### Task 3: Replace Supabase with PocketBase in the React app

**Files:**
- Modify: `package.json`
- Create: `src/lib/pocketbase.ts`
- Delete: `src/lib/supabase.ts`
- Modify: `src/lib/notes.ts`
- Modify: `src/contexts/AuthContext.tsx`
- Modify: `src/components/auth/AuthModal.tsx`
- Modify: `src/components/auth/UserMenu.tsx`
- Modify: `.env.example`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `notes` collection + `users` auth collection from Task 2 (must exist with the exact field names and rules from Task 2 for the manual smoke test at the end of this task to pass — `npm run build`/`npm run lint` do not require a live backend).
- Produces: `pb` client (`src/lib/pocketbase.ts`), used by every other file in this task. `getNote(userId: string, topicId: string): Promise<Block[] | null>` and `upsertNote(userId: string, topicId: string, content: Block[]): Promise<void>` in `src/lib/notes.ts` — signatures unchanged from the Supabase version, so `src/hooks/useNotes.ts` needs no edits. `useAuthContext(): { user: RecordModel | null, loading: boolean }` — `user.id` still works because `RecordModel` carries an `id: string` field, so `src/pages/TopicPage.tsx` and `src/components/layout/Layout.tsx` need no edits either.

- [ ] **Step 1: Swap the dependency in `package.json`**

Remove this line from `dependencies`:

```json
    "@supabase/supabase-js": "^2.99.1",
```

Add this line to `dependencies` (alphabetical position, after `@webcontainer/api`):

```json
    "pocketbase": "^0.27.0",
```

Then install:

```bash
cd /home/jaywee92/back-dev-guide
npm install
```

Expected: `package-lock.json` updates; `node_modules/pocketbase` exists; `node_modules/@supabase` is gone.

- [ ] **Step 2: Create `src/lib/pocketbase.ts`**

```ts
import PocketBase from 'pocketbase'

export const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL as string)
```

- [ ] **Step 3: Delete `src/lib/supabase.ts`**

```bash
rm /home/jaywee92/back-dev-guide/src/lib/supabase.ts
```

- [ ] **Step 4: Replace `src/lib/notes.ts`**

```ts
import type { Block } from '@blocknote/core'
import { ClientResponseError } from 'pocketbase'
import { pb } from './pocketbase'

interface NoteRecord {
  id: string
  content_json: Block[]
}

export async function getNote(
  userId: string,
  topicId: string,
): Promise<Block[] | null> {
  try {
    const record = await pb
      .collection('notes')
      .getFirstListItem<NoteRecord>(
        pb.filter('user = {:userId} && topic_id = {:topicId}', { userId, topicId }),
      )
    return record.content_json
  } catch (error) {
    if (error instanceof ClientResponseError && error.status === 404) return null
    throw error
  }
}

export async function upsertNote(
  userId: string,
  topicId: string,
  content: Block[],
): Promise<void> {
  try {
    const existing = await pb
      .collection('notes')
      .getFirstListItem<NoteRecord>(
        pb.filter('user = {:userId} && topic_id = {:topicId}', { userId, topicId }),
      )
    await pb.collection('notes').update(existing.id, { content_json: content })
  } catch (error) {
    if (!(error instanceof ClientResponseError) || error.status !== 404) throw error
    await pb.collection('notes').create({
      user: userId,
      topic_id: topicId,
      content_json: content,
    })
  }
}
```

`pb.filter()` safely binds `userId`/`topicId` into the filter string (no manual escaping needed). `notes` records get `created`/`updated` system timestamps automatically — no separate `updated_at` field to maintain.

- [ ] **Step 5: Replace `src/contexts/AuthContext.tsx`**

```tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { RecordModel } from 'pocketbase'
import { pb } from '@/lib/pocketbase'

interface AuthContextValue {
  user: RecordModel | null
  loading: boolean
}

const AuthContext = createContext<AuthContextValue>({ user: null, loading: false })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<RecordModel | null>(pb.authStore.record)

  useEffect(() => {
    return pb.authStore.onChange((_token, record) => {
      setUser(record)
    })
  }, [])

  return <AuthContext.Provider value={{ user, loading: false }}>{children}</AuthContext.Provider>
}

export const useAuthContext = () => useContext(AuthContext)
```

`pb.authStore` is synchronous (reads from `localStorage` at construction), so there's no async session fetch and `loading` is always `false` — `Layout.tsx`'s `!loading && (...)` guard still works, it just never blocks.

- [ ] **Step 6: Replace `src/components/auth/AuthModal.tsx`**

```tsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { ClientResponseError } from 'pocketbase'
import { pb } from '@/lib/pocketbase'

type Tab = 'login' | 'signup'

interface AuthModalProps {
  onClose: () => void
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const [tab, setTab] = useState<Tab>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (tab === 'login') {
        await pb.collection('users').authWithPassword(email, password)
      } else {
        await pb.collection('users').create({ email, password, passwordConfirm: password })
        await pb.collection('users').authWithPassword(email, password)
      }
      onClose()
    } catch (err) {
      setError(err instanceof ClientResponseError ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  async function handleOAuth(provider: 'github' | 'google') {
    setError(null)
    try {
      await pb.collection('users').authWithOAuth2({ provider })
      onClose()
    } catch (err) {
      setError(err instanceof ClientResponseError ? err.message : 'Something went wrong.')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-neutral-400 hover:text-neutral-600"
        >
          <X size={16} />
        </button>

        <h2 className="mb-5 text-lg font-semibold text-neutral-900">Sign in</h2>

        <div className="mb-4 flex gap-2">
          <button
            onClick={() => handleOAuth('github')}
            className="flex flex-1 items-center justify-center rounded-lg border border-neutral-200 py-2 text-sm font-medium hover:bg-neutral-50"
          >
            GitHub
          </button>
          <button
            onClick={() => handleOAuth('google')}
            className="flex flex-1 items-center justify-center rounded-lg border border-neutral-200 py-2 text-sm font-medium hover:bg-neutral-50"
          >
            Google
          </button>
        </div>

        <div className="my-4 flex items-center gap-2 text-xs text-neutral-400">
          <div className="h-px flex-1 bg-neutral-100" />
          or
          <div className="h-px flex-1 bg-neutral-100" />
        </div>

        <div className="mb-4 flex rounded-lg bg-neutral-100 p-1 text-sm">
          {(['login', 'signup'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-md py-1.5 font-medium transition-colors ${
                tab === t ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-500'
              }`}
            >
              {t === 'login' ? 'Log in' : 'Sign up'}
            </button>
          ))}
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-indigo-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-indigo-500"
            required
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? 'Loading…' : tab === 'login' ? 'Log in' : 'Sign up'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
```

The `emailSent` confirmation screen is removed: PocketBase logs the user in immediately after `create()` (no email-verification gate on this collection), so there's nothing to wait for.

- [ ] **Step 7: Replace `src/components/auth/UserMenu.tsx`**

```tsx
import { useState, useRef, useEffect } from 'react'
import type { RecordModel } from 'pocketbase'
import { LogOut, User as UserIcon } from 'lucide-react'
import { pb } from '@/lib/pocketbase'

interface UserMenuProps {
  user: RecordModel
}

export default function UserMenu({ user }: UserMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function signOut() {
    pb.authStore.clear()
    setOpen(false)
  }

  const initial = (user.email ?? 'U')[0].toUpperCase()

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700"
        title={user.email}
      >
        {initial}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 min-w-48 rounded-xl border border-neutral-200 bg-white py-1 shadow-lg">
          <div className="flex items-center gap-2 px-4 py-2 text-xs text-neutral-500">
            <UserIcon size={12} />
            {user.email}
          </div>
          <div className="my-1 h-px bg-neutral-100" />
          <button
            onClick={signOut}
            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 8: Update `.env.example`**

Replace its contents with:

```
VITE_POCKETBASE_URL=https://pb.jaywee92.de
```

PocketBase's default CORS (`*`) means the same URL works from `npm run dev` (`localhost:5173`) and the production build — no separate dev URL needed. Copy this to your local `.env` (`cp .env.example .env`) so `npm run dev` has a real value to read.

- [ ] **Step 9: Fix the stale default redirect in `src/App.tsx`**

Change:

```tsx
          <Route index element={<Navigate to="/topic/ts-types" replace />} />
```

to:

```tsx
          <Route index element={<Navigate to="/topic/ts-intro" replace />} />
```

(`ts-types` was the old skeleton topic ID, replaced by `ts-intro` when the topic registry was expanded — the redirect target was never updated.)

- [ ] **Step 10: Verify TypeScript and lint**

```bash
cd /home/jaywee92/back-dev-guide && npm run build && npm run lint
```

Expected: no errors, no warnings. If `tsc` complains about `user.email` or `user.id` having implicit `any`, double check the import is `type { RecordModel } from 'pocketbase'` (its `BaseModel` base has a `[key: string]: any` index signature, so plain field access type-checks without casts).

- [ ] **Step 11: Commit**

```bash
git add package.json package-lock.json src/lib/pocketbase.ts src/lib/notes.ts src/contexts/AuthContext.tsx src/components/auth/AuthModal.tsx src/components/auth/UserMenu.tsx .env.example src/App.tsx
git rm src/lib/supabase.ts
git commit -m "feat: replace Supabase with self-hosted PocketBase for auth and notes"
```

---

## End-to-end smoke test (after Tasks 1, 2, and 3 are all done)

This is manual — not part of any task's automated verification, since it requires the live VPS instance.

```bash
cd /home/jaywee92/back-dev-guide
cp .env.example .env   # if not already done in Task 3 Step 8
npm run dev
```

1. Open the app, click "Sign in", sign up with email/password → should land logged in immediately (no email-confirmation screen).
2. Open a topic, type something in the notes panel, wait for "Saved", reload the page → note content should still be there.
3. Sign out, sign back in with "GitHub" → popup should open, complete OAuth, and close back into the app logged in.
4. Open the app in a different browser (or incognito window) and log in with the same account → the same note content from step 2 should appear, confirming cross-device sync.
5. In the PocketBase Admin UI (`https://pb.jaywee92.de/_/`), open the `notes` collection and confirm exactly one record exists per topic you wrote a note for, owned by your user.
