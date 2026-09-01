# NexaBank

A simulated, educational fintech dashboard. **No real payment rails, banking
infrastructure, or real money are involved anywhere in this project.**

Static HTML/CSS/vanilla JS frontend, Supabase (Auth + Postgres + RLS) backend.
No build step, no Node server — deploys directly to Netlify as static files.

---

## 1. Before you run anything: apply the required SQL

The brief's existing schema supplies secure functions for **transfers only**
(`request_transfer`, `admin_approve_transfer`, `admin_reject_transfer`). It does
not include anywhere to store a transaction PIN, or any secure function for
deposits, withdrawals, PIN verification, or account creation on signup.

Rather than fake these client-side (which would mean either storing a PIN in
the browser or letting JavaScript edit balances directly — both of which this
project's own security rules forbid), run **`sql/setup.sql`** once in the
Supabase SQL editor first. It adds:

| Addition | Purpose |
|---|---|
| `profiles.pin_hash` column | Stores a bcrypt-style hash of the PIN — never plain text |
| `set_pin(p_pin)` | Lets the signed-in user set/replace their own PIN |
| `verify_pin(p_pin)` | Checks a PIN server-side, returns true/false only |
| `ensure_account()` | Creates the caller's account with a unique 10-digit number on first use |
| `process_deposit(amount, description)` | Credits the caller's own account; all math happens in Postgres |
| `process_withdrawal(amount, description, pin)` | Verifies PIN + balance, then debits — atomically |

All six are `SECURITY DEFINER` but every one scopes its work to `auth.uid()`,
so a user can only ever touch their own account/PIN — the same pattern the
brief already uses for `request_transfer()`. This does not disable or bypass
RLS.

One more thing to check on your end: if your `transfers` RLS policy only
allows a user to `SELECT` transfers where they're the **sender**, add a policy
allowing `SELECT` where `recipient_account_id` belongs to `auth.uid()` too —
otherwise recipients won't see incoming transfers in their history.

---

## 2. Project structure

```
/
  index.html        Landing page
  login.html        Sign in
  register.html     Sign up
  dashboard.html     Balance, stats, recent activity, deposit/withdraw
  transfer.html      Send money + transfer history
  transactions.html  Full transaction history (search/filter/paginate)
  profile.html        Profile view/edit + PIN change
  admin.html          Admin-only: overview, pending transfers, customers, monitoring
  css/  style.css · auth.css · dashboard.css · admin.css
  js/   supabase.js · utils.js · auth.js · register.js · login.js ·
        dashboard.js · transfer.js · transactions.js · profile.js · admin.js
  sql/  setup.sql
```

## 3. How the security model works

- **Auth**: Supabase Auth (`supabaseClient.auth`) handles sign-up/sign-in/session.
  Passwords are never touched by this app's own code — Supabase Auth owns them.
- **Admin access**: every admin check reads `profiles.role` for the
  *authenticated* user via `getProfile()` / `requireAdmin()` in `utils.js`.
  There is no `if (email === "owner@nexabank.com")` anywhere in the code —
  search the repo, it isn't there. The database is the source of truth; a
  user can't grant themselves admin from the client because `profiles.role`
  is only ever read, never written, by this frontend.
- **Balances**: never computed or written by JavaScript. Deposits, withdrawals,
  and transfers all go through Postgres functions (`process_deposit`,
  `process_withdrawal`, `request_transfer`, `admin_approve_transfer`,
  `admin_reject_transfer`) that run with elevated rights but validate the
  caller and amounts before touching a row.
- **PIN**: entered by the user, sent once over TLS to `verify_pin()`/`set_pin()`,
  and never written to `localStorage`, `sessionStorage`, cookies, or logs on
  the client. Only a bcrypt hash lives in the database.
- **Publishable key only**: `js/supabase.js` uses the `sb_publishable_...` key.
  No secret/service-role key appears anywhere in this codebase — it never
  should, since anything shipped to the browser is public.

## 4. Netlify deployment

1. Push this folder to a Git repo (or drag-and-drop the folder into Netlify's
   deploy UI).
2. Netlify site settings → Build & deploy: no build command needed, publish
   directory is the project root (`/`).
3. **Supabase Auth URL configuration** (Supabase dashboard → Authentication →
   URL Configuration):
   - Set **Site URL** to your Netlify domain, e.g. `https://your-site.netlify.app`.
   - Add the same URL (and `http://localhost:*` for local testing, if you use
     it) to **Redirect URLs**.
   - This matters because Supabase Auth checks these before completing
     email-confirmation or magic-link redirects — without it, users confirming
     their email will land on an error page instead of your app.
4. If email confirmation is enabled on the Supabase project, new users will
   see "check your email" after registering rather than an instant session —
   this is expected and handled in `register.js`.
5. No environment variables are required at build time since the publishable
   key is a public, client-safe value already embedded in `js/supabase.js`.

## 4b. Migration 2: admin-approved deposits & withdrawals, USD, dark mode, reveal buttons

Run **`sql/pending_transactions.sql`** in the Supabase SQL editor (after `sql/setup.sql`).
It reuses your existing `transactions` table (per your instruction) rather than creating
new tables:

- Makes `transactions.balance_after` nullable (unknown until approval) and adds `rejection_reason`, `reviewed_at` columns.
- Adds `request_deposit(amount, description)` and `request_withdrawal(amount, description, pin)` — both insert a `status='pending'` row and never touch `accounts.balance`. `request_withdrawal` verifies the PIN via `verify_pin()` and pre-checks balance, but the actual debit only happens on approval.
- Adds `admin_approve_deposit`, `admin_reject_deposit`, `admin_approve_withdrawal`, `admin_reject_withdrawal` — all `SECURITY DEFINER`, all gated by a `_is_admin()` helper that re-reads `profiles.role` for `auth.uid()` on every call. `admin_approve_withdrawal` re-checks balance at approval time and auto-fails the transaction if it's no longer covered, rather than ever letting balance go negative.
- `process_deposit()`/`process_withdrawal()` (immediate-effect versions) are left in the database untouched but are no longer called by the frontend's request flow.
- A commented-out RLS policy snippet is included in case your `transactions` table doesn't yet let admins `SELECT` every user's rows — uncomment and run it if the admin Transaction Monitoring tab returns only the admin's own transactions.

Everything else in this pass (USD display via `Intl.NumberFormat`, dark/light theme with `localStorage` persistence, password/PIN reveal toggles, balance hide/reveal) is frontend-only and needs no additional SQL.

## 5. Local preview

Any static file server works, e.g.:

```
npx serve .
```

or just open `index.html` directly — Supabase Auth's redirect flows work
best served over `http://localhost`, though, so a local server is recommended
over `file://`.
