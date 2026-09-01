/* ==========================================================================
   NexaBank — Transaction history
   ========================================================================== */

let txAccount = null;
let allTx = [];
let filteredTx = [];
let currentPage = 1;
const PAGE_SIZE = 10;

document.addEventListener("DOMContentLoaded", async () => {
  const session = await requireSession();
  if (!session) return;

  let profile;
  try {
    profile = await getProfile(session.user.id);
    txAccount = await getAccount(session.user.id);
  } catch (err) {
    console.error(err);
    showToast("Couldn't load your account.", "error");
    return;
  }

  renderSidebar("transactions", {
    name: `${profile.first_name} ${profile.last_name}`,
    initials: initials(profile.first_name, profile.last_name),
    isAdmin: profile.role === "admin"
  });

  await loadTransactions();
  bindFilters();
});

async function loadTransactions() {
  const wrap = document.getElementById("tx-table-wrap");
  wrap.innerHTML = `<div class="skeleton skel-row"></div><div class="skeleton skel-row"></div><div class="skeleton skel-row"></div><div class="skeleton skel-row"></div>`;

  const { data, error } = await supabaseClient
    .from("transactions")
    .select("*")
    .eq("account_id", txAccount.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    wrap.innerHTML = `<div class="state-block state-error"><div class="state-icon">${ICON_ALERT_LG}</div><h4>We couldn't load your transactions</h4><p>Please try again.</p><button type="button" class="btn btn-ghost btn-sm" id="tx-history-retry-btn">Try again</button></div>`;
    document.getElementById("tx-history-retry-btn")?.addEventListener("click", loadTransactions);
    return;
  }
  allTx = data || [];
  applyFilters();
}

function bindFilters() {
  document.getElementById("tx-search").addEventListener("input", debounce(applyFilters, 200));
  document.getElementById("tx-type-filter").addEventListener("change", applyFilters);
  document.getElementById("tx-status-filter").addEventListener("change", applyFilters);
  document.getElementById("tx-date-filter").addEventListener("change", applyFilters);
  document.getElementById("pg-prev").addEventListener("click", () => { if (currentPage > 1) { currentPage--; renderTable(); } });
  document.getElementById("pg-next").addEventListener("click", () => {
    const totalPages = Math.max(1, Math.ceil(filteredTx.length / PAGE_SIZE));
    if (currentPage < totalPages) { currentPage++; renderTable(); }
  });
}

function applyFilters() {
  const q = document.getElementById("tx-search").value.trim().toLowerCase();
  const type = document.getElementById("tx-type-filter").value;
  const status = document.getElementById("tx-status-filter").value;
  const date = document.getElementById("tx-date-filter").value;

  filteredTx = allTx.filter((t) => {
    if (type && t.type !== type) return false;
    if (status && t.status !== status) return false;
    if (date) {
      const d = new Date(t.created_at).toISOString().slice(0, 10);
      if (d !== date) return false;
    }
    if (q && !(t.description || "").toLowerCase().includes(q) && !t.type.includes(q)) return false;
    return true;
  });
  currentPage = 1;
  renderTable();
}

function renderTable() {
  const wrap = document.getElementById("tx-table-wrap");
  if (filteredTx.length === 0) {
    wrap.innerHTML = `<div class="state-block"><div class="state-icon">${ICON_SEARCH}</div><h4>No matching transactions</h4><p>Try adjusting your search or filters.</p></div>`;
    document.getElementById("pagination").style.display = "none";
    return;
  }
  const totalPages = Math.max(1, Math.ceil(filteredTx.length / PAGE_SIZE));
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filteredTx.slice(start, start + PAGE_SIZE);

  wrap.innerHTML = `
    <div class="table-wrap">
      <table class="data-table">
        <thead><tr><th>Date</th><th>Type</th><th>Description</th><th>Amount</th><th>Status</th><th>Balance after</th></tr></thead>
        <tbody>
          ${pageItems.map((t) => {
            const isCredit = t.type === "deposit";
            return `<tr>
              <td data-label="Date">${formatDate(t.created_at)}</td>
              <td data-label="Type">${capitalize(t.type)}</td>
              <td data-label="Description">${escapeHtml(t.description || "—")}</td>
              <td data-label="Amount" class="mono ${isCredit ? "text-accent" : "text-danger"}">${isCredit ? "+" : "-"}${displayCurrency(t.amount)}</td>
              <td data-label="Status"><span class="badge badge-${t.status}">${t.status}</span></td>
              <td data-label="Balance after" class="mono">${t.balance_after === null || t.balance_after === undefined ? "—" : displayCurrency(t.balance_after)}</td>
            </tr>`;
          }).join("")}
        </tbody>
      </table>
    </div>`;

  const pagination = document.getElementById("pagination");
  pagination.style.display = "flex";
  document.getElementById("pg-info").textContent = `Page ${currentPage} of ${totalPages}`;
  document.getElementById("pg-prev").disabled = currentPage <= 1;
  document.getElementById("pg-next").disabled = currentPage >= totalPages;
}

function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}
