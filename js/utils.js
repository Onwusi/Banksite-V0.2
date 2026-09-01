/* ==========================================================================
   NexaBank — shared utilities
   ========================================================================== */

/* ---------- Icons (inline SVG, inherit color via currentColor) ---------- */
const ICON_EYE = `<svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z"/><circle cx="12" cy="12" r="3"/></svg>`;
const ICON_EYE_OFF = `<svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a13.16 13.16 0 0 1-3.06 3.94"/><path d="M6.61 6.61A13.53 13.53 0 0 0 1 12s4 8 11 8a9.26 9.26 0 0 0 5.39-1.61"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
const ICON_SUN = `<svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>`;
const ICON_MOON = `<svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/></svg>`;
const ICON_MENU = `<svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`;
const ICON_DASHBOARD = `<svg aria-hidden="true" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>`;
const ICON_TRANSFER = `<svg aria-hidden="true" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3 3 7l4 4"/><path d="M3 7h13a4 4 0 0 1 4 4v1"/><path d="M17 21l4-4-4-4"/><path d="M21 17H8a4 4 0 0 1-4-4v-1"/></svg>`;
const ICON_LIST = `<svg aria-hidden="true" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`;
const ICON_PLUS = `<svg aria-hidden="true" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
const ICON_MINUS = `<svg aria-hidden="true" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
const ICON_USER = `<svg aria-hidden="true" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
const ICON_SETTINGS = `<svg aria-hidden="true" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg>`;
const ICON_SHIELD = `<svg aria-hidden="true" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 3 6v6c0 5 3.8 9 9 10 5.2-1 9-5 9-10V6l-9-4Z"/></svg>`;
const ICON_LOGOUT = `<svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`;
const ICON_ARROW_DOWN = `<svg aria-hidden="true" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>`;
const ICON_ARROW_UP = `<svg aria-hidden="true" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>`;
const ICON_ARROW_RIGHT = `<svg aria-hidden="true" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`;
const ICON_CHEVRON_LEFT = `<svg aria-hidden="true" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`;
const ICON_CHEVRON_RIGHT = `<svg aria-hidden="true" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`;
const ICON_CHECK = `<svg aria-hidden="true" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
const ICON_X = `<svg aria-hidden="true" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
const ICON_ALERT = `<svg aria-hidden="true" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
const ICON_INFO = `<svg aria-hidden="true" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
const ICON_SEARCH = `<svg aria-hidden="true" viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`;
const ICON_INBOX = `<svg aria-hidden="true" viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z"/></svg>`;
const ICON_USERS = `<svg aria-hidden="true" viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`;
const ICON_ALERT_LG = `<svg aria-hidden="true" viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
const ICON_CHECK_LG = `<svg aria-hidden="true" viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;

/* ---------- Safe error messaging ----------
   Supabase/Postgres error text can be technical (constraint names, function
   signatures, etc.) and shouldn't be shown to end users as-is. This maps a
   handful of known, expected failure cases to plain banking language and
   otherwise falls back to a generic message — the real error still goes to
   console.error by every caller for debugging.
   ------------------------------------------------------------------------ */
function friendlyError(err, fallback = "We couldn't complete your request. Please try again.") {
  const raw = (err && err.message) || "";
  const patterns = [
    [/incorrect pin|invalid pin|pin.*(incorrect|invalid|does not match)/i, "Incorrect PIN. Please try again."],
    [/no pin has been set/i, "You haven't created a transaction PIN yet."],
    [/insufficient/i, "Insufficient balance for this request."],
    [/recipient.*(not found|does not exist)|account.*(not found|does not exist)/i, "We couldn't find that account number."],
    [/invalid login credentials/i, "Incorrect email or password."],
    [/user already registered|already registered/i, "An account with this email already exists."],
    [/rate limit/i, "Too many attempts. Please wait a moment and try again."],
    [/network|fetch/i, "We're having trouble connecting. Please check your connection and try again."],
    [/not authenticated|jwt/i, "Your session has expired. Please sign in again."],
    [/admin access only|not.*admin/i, "This action requires administrator access."]
  ];
  for (const [re, friendly] of patterns) {
    if (re.test(raw)) return friendly;
  }
  return fallback;
}

/* ---------- Formatting ---------- */
const CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

function formatCurrency(amount) {
  const n = Number(amount || 0);
  return CURRENCY_FORMATTER.format(n);
}

function formatDate(iso, opts) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-NG", opts || { year: "numeric", month: "short", day: "numeric" });
}

function formatDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("en-NG", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function formatAccountNumber(num) {
  if (!num) return "—";
  const s = String(num);
  return s.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

function initials(first, last) {
  return ((first || "")[0] || "").toUpperCase() + ((last || "")[0] || "").toUpperCase();
}

function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

/* ==========================================================================
   Theme (dark / light mode)
   Persisted in localStorage only — no account data, safe to store client-side.
   The actual attribute is also set synchronously by an inline blocking
   script in each page's <head> (before CSS renders) to avoid a flash of
   the wrong theme; this module just keeps everything in sync afterward.
   ========================================================================== */
const THEME_KEY = "nexabank-theme";

function getTheme() {
  return localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
}

function applyTheme(theme) {
  const t = theme === "dark" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", t);
  localStorage.setItem(THEME_KEY, t);
  document.querySelectorAll("[data-theme-toggle]").forEach(updateThemeButton);
}

function updateThemeButton(btn) {
  const dark = getTheme() === "dark";
  btn.setAttribute("aria-pressed", dark ? "true" : "false");
  btn.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
  btn.innerHTML = dark ? ICON_SUN : ICON_MOON;
}

function initThemeToggle(btn) {
  if (!btn || btn.dataset.themeBound) return;
  btn.dataset.themeBound = "1";
  updateThemeButton(btn);
  btn.addEventListener("click", () => {
    applyTheme(getTheme() === "dark" ? "light" : "dark");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // Static toggle buttons already in the page markup (public pages).
  document.querySelectorAll("[data-theme-toggle]").forEach(initThemeToggle);
  initEyeToggles();
});

/* ==========================================================================
   Balance visibility (hide/reveal)
   UI-only — never touches the database. Preference persisted locally.
   ========================================================================== */
const BALANCE_VISIBLE_KEY = "nexabank-balance-visible";

function isBalanceVisible() {
  const stored = localStorage.getItem(BALANCE_VISIBLE_KEY);
  return stored === null ? true : stored === "true";
}

function setBalanceVisible(visible) {
  localStorage.setItem(BALANCE_VISIBLE_KEY, visible ? "true" : "false");
}

function maskCurrencyString(formatted) {
  return formatted.replace(/[0-9]/g, "•");
}

function displayCurrency(amount) {
  const formatted = formatCurrency(amount);
  return isBalanceVisible() ? formatted : maskCurrencyString(formatted);
}

function updateBalanceToggleIcon(btn) {
  const visible = isBalanceVisible();
  btn.innerHTML = visible ? ICON_EYE : ICON_EYE_OFF;
  btn.setAttribute("aria-label", visible ? "Hide balance" : "Show balance");
  btn.setAttribute("aria-pressed", visible ? "false" : "true");
}

function bindBalanceToggle(btn, onToggle) {
  if (!btn) return;
  updateBalanceToggleIcon(btn);
  btn.addEventListener("click", () => {
    setBalanceVisible(!isBalanceVisible());
    updateBalanceToggleIcon(btn);
    onToggle && onToggle();
  });
}

/* ==========================================================================
   Password / PIN reveal toggles
   Purely a display change on the current input element — never persists
   or copies the value anywhere. Works for:
   - single inputs: <button data-toggle-for="inputId">
   - grouped 4-digit PIN inputs: <button data-toggle-group="groupName">
     toggling every input inside `.pin-inputs[data-group="groupName"]`
   ========================================================================== */
function initEyeToggles(root = document) {
  root.querySelectorAll("[data-toggle-for]").forEach((btn) => {
    if (btn.dataset.eyeBound) return;
    const input = document.getElementById(btn.dataset.toggleFor);
    if (!input) return;
    btn.dataset.eyeBound = "1";
    btn.setAttribute("type", "button");
    btn.setAttribute("aria-label", "Show password");
    btn.setAttribute("aria-pressed", "false");
    btn.innerHTML = ICON_EYE;
    btn.addEventListener("click", () => {
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      btn.setAttribute("aria-pressed", show ? "true" : "false");
      btn.setAttribute("aria-label", show ? "Hide password" : "Show password");
      btn.innerHTML = show ? ICON_EYE_OFF : ICON_EYE;
    });
  });

  root.querySelectorAll("[data-toggle-group]").forEach((btn) => {
    if (btn.dataset.eyeBound) return;
    const group = btn.dataset.toggleGroup;
    const inputs = root.querySelectorAll(`.pin-inputs[data-group="${group}"] input`);
    if (!inputs.length) return;
    btn.dataset.eyeBound = "1";
    btn.setAttribute("type", "button");
    btn.setAttribute("aria-label", "Show PIN");
    btn.setAttribute("aria-pressed", "false");
    btn.innerHTML = ICON_EYE;
    btn.addEventListener("click", () => {
      const show = inputs[0].type === "password";
      inputs.forEach((i) => (i.type = show ? "text" : "password"));
      btn.setAttribute("aria-pressed", show ? "true" : "false");
      btn.setAttribute("aria-label", show ? "Hide PIN" : "Show PIN");
      btn.innerHTML = show ? ICON_EYE_OFF : ICON_EYE;
    });
  });
}

/* ---------- Toasts ---------- */
function ensureToastStack() {
  let stack = document.getElementById("toast-stack");
  if (!stack) {
    stack = document.createElement("div");
    stack.id = "toast-stack";
    document.body.appendChild(stack);
  }
  return stack;
}

function showToast(message, type = "info", duration = 4200) {
  const stack = ensureToastStack();
  const el = document.createElement("div");
  el.className = `toast toast-${type}`;
  const icons = { success: ICON_CHECK, error: ICON_X, warn: ICON_ALERT, info: ICON_INFO };
  el.innerHTML = `<span class="toast-icon">${icons[type] || ICON_INFO}</span><span class="toast-msg">${escapeHtml(message)}</span><button class="toast-close" aria-label="Dismiss">${ICON_X}</button>`;
  stack.appendChild(el);

  const remove = () => {
    el.classList.add("toast-out");
    setTimeout(() => el.remove(), 250);
  };
  el.querySelector(".toast-close").addEventListener("click", remove);
  setTimeout(remove, duration);
}

/* ---------- Modals ---------- */
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add("open");
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove("open");
}
function confirmModal({ title, body, confirmLabel = "Confirm", danger = false, onConfirm }) {
  let backdrop = document.getElementById("confirm-modal");
  if (!backdrop) {
    backdrop = document.createElement("div");
    backdrop.id = "confirm-modal";
    backdrop.className = "modal-backdrop";
    document.body.appendChild(backdrop);
  }
  backdrop.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true">
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(body)}</p>
      <div class="modal-actions">
        <button class="btn btn-ghost" id="confirm-cancel">Cancel</button>
        <button class="btn ${danger ? "btn-danger" : "btn-primary"}" id="confirm-ok">${escapeHtml(confirmLabel)}</button>
      </div>
    </div>`;
  backdrop.classList.add("open");
  backdrop.querySelector("#confirm-cancel").onclick = () => backdrop.classList.remove("open");
  backdrop.querySelector("#confirm-ok").onclick = () => {
    backdrop.classList.remove("open");
    onConfirm && onConfirm();
  };
  backdrop.onclick = (e) => { if (e.target === backdrop) backdrop.classList.remove("open"); };
}

/* ---------- Loading button helper ---------- */
function setButtonLoading(btn, loading, loadingText = "Please wait…") {
  if (!btn) return;
  if (loading) {
    btn.dataset.origLabel = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner"></span> ${loadingText}`;
  } else {
    btn.disabled = false;
    if (btn.dataset.origLabel) btn.innerHTML = btn.dataset.origLabel;
  }
}

/* ---------- Session guards ---------- */
async function requireSession(redirectTo = "login.html") {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    window.location.href = redirectTo;
    return null;
  }
  return session;
}

async function getProfile(userId) {
  const { data, error } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data;
}

async function getAccount(userId) {
  const { data, error } = await supabaseClient
    .from("accounts")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (error) throw error;
  return data;
}

async function requireAdmin(redirectTo = "dashboard.html") {
  const session = await requireSession();
  if (!session) return null;
  try {
    const profile = await getProfile(session.user.id);
    if (profile.role !== "admin") {
      showToast("Admin access only.", "error");
      setTimeout(() => (window.location.href = redirectTo), 1200);
      return null;
    }
    return { session, profile };
  } catch (e) {
    showToast("Could not verify permissions.", "error");
    return null;
  }
}

async function logout() {
  await supabaseClient.auth.signOut();
  window.location.href = "login.html";
}

/* ---------- Sidebar shell injection ---------- */
function renderSidebar(activePage, opts = {}) {
  const mount = document.getElementById("sidebar-mount");
  if (!mount) return;
  const isAdmin = !!opts.isAdmin;
  const items = [
    { key: "dashboard", href: "dashboard.html", icon: ICON_DASHBOARD, label: "Dashboard" },
    { key: "transfer", href: "transfer.html", icon: ICON_TRANSFER, label: "Transfer" },
    { key: "transactions", href: "transactions.html", icon: ICON_LIST, label: "Transactions" },
    { key: "deposit", href: "dashboard.html#deposit", icon: ICON_PLUS, label: "Deposit" },
    { key: "withdraw", href: "dashboard.html#withdraw", icon: ICON_MINUS, label: "Withdraw" },
    { key: "profile", href: "profile.html", icon: ICON_USER, label: "Profile" },
    { key: "settings", href: "profile.html#settings", icon: ICON_SETTINGS, label: "Settings" },
  ];
  if (isAdmin) items.push({ key: "admin", href: "admin.html", icon: ICON_SHIELD, label: "Admin panel" });

  const name = opts.name || "";
  mount.innerHTML = `
    <div class="sidebar-scrim" id="sidebar-scrim"></div>
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-header">
        <a href="dashboard.html" class="sidebar-brand" aria-label="NexaBank home">
          <span class="brand-mark">N</span> NexaBank
        </a>
        <button type="button" class="theme-toggle-btn" data-theme-toggle aria-label="Toggle dark mode"></button>
      </div>
      <nav class="sidebar-nav">
        ${items.map(it => `<a href="${it.href}" class="${activePage === it.key ? "active" : ""}"><span class="nav-ic">${it.icon}</span>${it.label}</a>`).join("")}
      </nav>
      <div class="sidebar-foot">
        <div class="sidebar-user">
          <span class="avatar">${escapeHtml(opts.initials || "")}</span>
          <span class="sidebar-user-name">${escapeHtml(name)}</span>
        </div>
        <a href="#" id="logout-link" class="btn btn-ghost btn-block btn-sm" style="margin-top:8px;">${ICON_LOGOUT}<span>Logout</span></a>
      </div>
    </aside>`;
  document.getElementById("logout-link").addEventListener("click", (e) => { e.preventDefault(); logout(); });
  initThemeToggle(mount.querySelector("[data-theme-toggle]"));

  const topbar = document.getElementById("topbar-mount");
  if (topbar) {
    topbar.innerHTML = `
      <div class="topbar">
        <button class="hamburger" id="menu-toggle" aria-label="Open menu">${ICON_MENU}</button>
        <a href="dashboard.html" class="sidebar-brand" style="padding:0;" aria-label="NexaBank home"><span class="brand-mark">N</span> NexaBank</a>
        <button type="button" class="theme-toggle-btn" data-theme-toggle aria-label="Toggle dark mode"></button>
      </div>`;
    document.getElementById("menu-toggle").addEventListener("click", () => {
      document.getElementById("sidebar").classList.add("open");
      document.getElementById("sidebar-scrim").classList.add("open");
    });
    document.getElementById("sidebar-scrim").addEventListener("click", () => {
      document.getElementById("sidebar").classList.remove("open");
      document.getElementById("sidebar-scrim").classList.remove("open");
    });
    initThemeToggle(topbar.querySelector("[data-theme-toggle]"));
  }
}

/* ---------- PIN modal (used by withdraw / transfer) ----------
   Collects a 4-digit PIN from the user for a sensitive action.
   Verification itself happens server-side via the verify_pin() RPC —
   see README/sql for the required backend function.
------------------------------------------------------------------ */
function collectPin() {
  return new Promise((resolve) => {
    let backdrop = document.getElementById("pin-modal");
    if (!backdrop) {
      backdrop = document.createElement("div");
      backdrop.id = "pin-modal";
      backdrop.className = "modal-backdrop";
      document.body.appendChild(backdrop);
    }
    backdrop.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true">
        <h3>Enter transaction PIN</h3>
        <p>For your security, confirm your 4-digit PIN to continue.</p>
        <div class="flex items-center gap-8">
          <div class="pin-inputs" id="pin-inputs" data-group="confirm-action-pin">
            ${[0,1,2,3].map(i => `<input type="password" inputmode="numeric" maxlength="1" pattern="[0-9]" data-i="${i}" autocomplete="off" />`).join("")}
          </div>
          <button type="button" class="eye-btn" data-toggle-group="confirm-action-pin" aria-label="Show PIN"></button>
        </div>
        <div class="modal-actions">
          <button class="btn btn-ghost" id="pin-cancel">Cancel</button>
          <button class="btn btn-primary" id="pin-ok">Confirm</button>
        </div>
      </div>`;
    backdrop.classList.add("open");
    initEyeToggles(backdrop);
    const inputs = [...backdrop.querySelectorAll(".pin-inputs input")];
    inputs[0].focus();
    inputs.forEach((inp, idx) => {
      inp.addEventListener("input", () => {
        inp.value = inp.value.replace(/\D/g, "").slice(0, 1);
        if (inp.value && inputs[idx + 1]) inputs[idx + 1].focus();
      });
      inp.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" && !inp.value && inputs[idx - 1]) inputs[idx - 1].focus();
      });
    });
    const cleanup = (val) => { backdrop.classList.remove("open"); resolve(val); };
    backdrop.querySelector("#pin-cancel").onclick = () => cleanup(null);
    backdrop.querySelector("#pin-ok").onclick = () => {
      const pin = inputs.map(i => i.value).join("");
      if (pin.length !== 4) { showToast("Enter your full 4-digit PIN.", "error"); return; }
      cleanup(pin);
    };
  });
}

/* ---------- Footer (public-facing pages) ---------- */
function renderFooter() {
  const mount = document.getElementById("footer-mount");
  if (!mount) return;
  const year = new Date().getFullYear();
  mount.innerHTML = `
    <footer class="site-footer">
      <div class="container footer-inner">
        <div class="footer-col footer-brand-col">
          <a href="index.html" class="sidebar-brand" aria-label="NexaBank home">
            <span class="brand-mark">N</span> NexaBank
          </a>
          <p class="footer-desc">Secure digital banking made simple — manage your account, payments, and transactions in one place.</p>
        </div>
        <div class="footer-col">
          <div class="footer-heading">Company</div>
          <a href="about.html">About</a>
          <a href="about.html#careers">Careers</a>
          <a href="contact.html">Contact</a>
        </div>
        <div class="footer-col">
          <div class="footer-heading">Support</div>
          <a href="contact.html#help">Help Center</a>
          <a href="contact.html">Contact Support</a>
          <a href="security.html">Security</a>
        </div>
        <div class="footer-col">
          <div class="footer-heading">Legal</div>
          <a href="privacy.html">Privacy Policy</a>
          <a href="terms.html">Terms &amp; Conditions</a>
          <a href="privacy.html#cookies">Cookie Policy</a>
        </div>
      </div>
      <div class="container footer-bottom">
        <span>© ${year} NexaBank. All rights reserved.</span>
        <span class="footer-disclosure">NexaBank is a technology platform, not just a bank. Banking services provided by partner banks, Members FDIC.  Secured by 256-bit encryption. Member FDIC. Equal Housing Lender.</span>
      </div>
    </footer>`;
}
document.addEventListener("DOMContentLoaded", renderFooter);

/* ---------- Query param helper ---------- */
function qs(name) {
  return new URLSearchParams(window.location.search).get(name);
}
