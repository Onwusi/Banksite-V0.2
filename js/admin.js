/* ==========================================================================
   NexaBank — Admin dashboard
   Access is gated purely by the authenticated user's `profiles.role`,
   verified via requireAdmin() (utils.js) — never by email/username checks.
   All approvals/rejections happen through SECURITY DEFINER database
   functions (admin_approve_transfer / admin_reject_transfer /
   admin_approve_deposit / admin_reject_deposit / admin_approve_withdrawal /
   admin_reject_withdrawal — see /sql/setup.sql and
   /sql/pending_transactions.sql). The client never edits balances directly.
   ========================================================================== */

let adminProfile = null;
let profilesById = {};
let accountsById = {};
let accountsByUserId = {};
let lastTotalBalance = 0;

document.addEventListener("DOMContentLoaded", async () => {
  const result = await requireAdmin();
  if (!result) return;
  adminProfile = result.profile;

  renderSidebar("admin", {
    name: `${adminProfile.first_name} ${adminProfile.last_name}`,
    initials: initials(adminProfile.first_name, adminProfile.last_name),
    isAdmin: true
  });

  bindTabs();
  bindBalanceToggle(document.getElementById("ov-balance-eye"), renderOverviewBalance);
  await loadLookups();
  await Promise.all([
    loadOverview(),
    loadPendingDeposits(),
    loadPendingWithdrawals(),
    loadPendingTransfers(),
    loadCustomers(),
    loadAllTransactions()
  ]);
  bindTransactionFilters();
});

function bindTabs() {
  document.querySelectorAll(".admin-tabs button").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".admin-tabs button").forEach((b) => b.classList.remove("active"));
      document.querySelectorAll(".admin-panel").forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(btn.dataset.panel).classList.add("active");
    });
  });
}

async function loadLookups() {
  const [{ data: profiles }, { data: accounts }] = await Promise.all([
    supabaseClient.from("profiles").select("*"),
    supabaseClient.from("accounts").select("*")
  ]);
  profilesById = {};
  accountsById = {};
  accountsByUserId = {};
  (profiles || []).forEach((p) => (profilesById[p.id] = p));
  (accounts || []).forEach((a) => {
    accountsById[a.id] = a;
    accountsByUserId[a.user_id] = a;
  });
}

/* ---------- Overview ---------- */
function renderOverviewBalance() {
  document.getElementById("ov-balance").textContent = displayCurrency(lastTotalBalance);
}

async function loadOverview() {
  try {
    const totalUsers = Object.keys(profilesById).length;
    const accountsArr = Object.values(accountsById);
    const totalAccounts = accountsArr.length;
    lastTotalBalance = accountsArr.reduce((sum, a) => sum + Number(a.balance || 0), 0);

    const [{ data: transfers, error: tErr }, { data: txs, error: xErr }] = await Promise.all([
      supabaseClient.from("transfers").select("status"),
      supabaseClient.from("transactions").select("status,type")
    ]);
    if (tErr) throw tErr;
    if (xErr) throw xErr;

    const pendingTransfers = transfers.filter((t) => t.status === "pending").length;
    const approvedTransfers = transfers.filter((t) => t.status === "approved").length;
    const rejectedTransfers = transfers.filter((t) => t.status === "rejected").length;
    const pendingDeposits = txs.filter((t) => t.type === "deposit" && t.status === "pending").length;
    const pendingWithdrawals = txs.filter((t) => t.type === "withdrawal" && t.status === "pending").length;
    const totalPending = pendingTransfers + pendingDeposits + pendingWithdrawals;

    document.getElementById("ov-users").textContent = totalUsers;
    document.getElementById("ov-accounts").textContent = totalAccounts;
    renderOverviewBalance();
    document.getElementById("ov-pending").textContent = totalPending;
    document.getElementById("ov-approved").textContent = approvedTransfers;
    document.getElementById("ov-rejected").textContent = rejectedTransfers;

    const breakdown = document.getElementById("ov-pending-breakdown");
    if (breakdown) {
      breakdown.textContent = `${pendingDeposits} deposit${pendingDeposits === 1 ? "" : "s"} · ${pendingWithdrawals} withdrawal${pendingWithdrawals === 1 ? "" : "s"} · ${pendingTransfers} transfer${pendingTransfers === 1 ? "" : "s"}`;
    }
  } catch (err) {
    console.error(err);
    showToast(friendlyError(err, "We couldn't load overview statistics."), "error");
  }
}

/* ---------- Shared: generic reject modal ---------- */
function openRejectModal({ title = "Reason for rejection", confirmLabel = "Reject", onReject }) {
  let backdrop = document.getElementById("reject-modal");
  if (!backdrop) {
    backdrop = document.createElement("div");
    backdrop.id = "reject-modal";
    backdrop.className = "modal-backdrop";
    document.body.appendChild(backdrop);
  }
  backdrop.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true">
      <h3>${escapeHtml(title)}</h3>
      <p>This will be shown to the customer.</p>
      <div class="field">
        <textarea id="reject-reason" rows="3" placeholder="e.g. Could not be verified."></textarea>
      </div>
      <div class="modal-actions">
        <button class="btn btn-ghost" id="reject-cancel">Cancel</button>
        <button class="btn btn-danger" id="reject-confirm">${escapeHtml(confirmLabel)}</button>
      </div>
    </div>`;
  backdrop.classList.add("open");
  backdrop.querySelector("#reject-cancel").onclick = () => backdrop.classList.remove("open");
  backdrop.querySelector("#reject-confirm").onclick = async () => {
    const reason = document.getElementById("reject-reason").value.trim();
    if (!reason) { showToast("A rejection reason is required.", "error"); return; }
    backdrop.classList.remove("open");
    await onReject(reason);
  };
}

/* ---------- Pending transfers ---------- */
async function loadPendingTransfers() {
  const wrap = document.getElementById("pending-transfers-list");
  wrap.innerHTML = `<div class="skeleton skel-row"></div><div class="skeleton skel-row"></div>`;

  const { data, error } = await supabaseClient
    .from("transfers")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error);
    wrap.innerHTML = `<div class="state-block state-error"><div class="state-icon">${ICON_ALERT_LG}</div><h4>We couldn't load pending transfers</h4><p>Please try again.</p><button type="button" class="btn btn-ghost btn-sm" id="pending-transfers-retry-btn">Try again</button></div>`;
    document.getElementById("pending-transfers-retry-btn")?.addEventListener("click", loadPendingTransfers);
    return;
  }
  if (!data || data.length === 0) {
    wrap.innerHTML = `<div class="state-block"><div class="state-icon">${ICON_CHECK_LG}</div><h4>All caught up</h4><p>No transfers are waiting for review.</p></div>`;
    return;
  }

  wrap.innerHTML = data.map((t) => {
    const senderAcct = accountsById[t.sender_account_id];
    const recipAcct = accountsById[t.recipient_account_id];
    const senderProfile = senderAcct ? profilesById[senderAcct.user_id] : null;
    const recipProfile = recipAcct ? profilesById[recipAcct.user_id] : null;
    return `
      <div class="transfer-card" data-id="${t.id}">
        <div class="tc-top">
          <span class="badge badge-pending">pending</span>
          <span class="tc-amt mono">${displayCurrency(t.amount)}</span>
        </div>
        <div class="tc-parties">
          <div class="tc-party">
            <div class="p-label">Sender</div>
            <div class="p-name">${escapeHtml(senderProfile ? senderProfile.first_name + " " + senderProfile.last_name : "Unknown")}</div>
            <div class="p-acct">${escapeHtml(senderProfile?.email || "")}</div>
            <div class="p-acct">${formatAccountNumber(senderAcct?.account_number)}</div>
          </div>
          <div class="tc-arrow">${ICON_ARROW_RIGHT}</div>
          <div class="tc-party">
            <div class="p-label">Recipient</div>
            <div class="p-name">${escapeHtml(recipProfile ? recipProfile.first_name + " " + recipProfile.last_name : "Unknown")}</div>
            <div class="p-acct">${escapeHtml(recipProfile?.email || "")}</div>
            <div class="p-acct">${formatAccountNumber(recipAcct?.account_number)}</div>
          </div>
        </div>
        <div class="tc-desc">${escapeHtml(t.description || "No description provided.")}</div>
        <div class="tc-date">${formatDateTime(t.created_at)}</div>
        <div class="tc-actions">
          <button class="btn btn-primary btn-sm approve-btn">Approve</button>
          <button class="btn btn-danger btn-sm reject-btn">Reject</button>
        </div>
      </div>`;
  }).join("");

  wrap.querySelectorAll(".approve-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.closest(".transfer-card").dataset.id;
      confirmModal({
        title: "Approve this transfer?",
        body: "Funds will move from the sender to the recipient immediately.",
        confirmLabel: "Approve",
        onConfirm: () => approveTransfer(id)
      });
    });
  });
  wrap.querySelectorAll(".reject-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.closest(".transfer-card").dataset.id;
      openRejectModal({
        title: "Reason for rejecting this transfer",
        confirmLabel: "Reject transfer",
        onReject: (reason) => rejectTransfer(id, reason)
      });
    });
  });
}

async function approveTransfer(id) {
  try {
    const { error } = await supabaseClient.rpc("admin_approve_transfer", { p_transfer_id: id });
    if (error) throw error;
    showToast("Transfer approved.", "success");
    await refreshAfterAction();
  } catch (err) {
    console.error(err);
    showToast(friendlyError(err, "We couldn't approve this transfer."), "error");
  }
}

async function rejectTransfer(id, reason) {
  try {
    const { error } = await supabaseClient.rpc("admin_reject_transfer", { p_transfer_id: id, p_rejection_reason: reason });
    if (error) throw error;
    showToast("Transfer rejected.", "success");
    await refreshAfterAction();
  } catch (err) {
    console.error(err);
    showToast(friendlyError(err, "We couldn't reject this transfer."), "error");
  }
}

/* ---------- Pending deposits & withdrawals ----------
   Both reuse the `transactions` table (status='pending') per your
   instruction, rather than separate pending_* tables. Approve/reject
   call the new admin_approve_deposit()/admin_reject_deposit()/
   admin_approve_withdrawal()/admin_reject_withdrawal() RPCs — see
   /sql/pending_transactions.sql. These are the only functions that ever
   move money for a deposit or withdrawal; the client just calls them.
------------------------------------------------------------------------- */
async function loadPendingDeposits() {
  await loadPendingTxOfType("deposit", "pending-deposits-list");
}
async function loadPendingWithdrawals() {
  await loadPendingTxOfType("withdrawal", "pending-withdrawals-list");
}

async function loadPendingTxOfType(type, containerId) {
  const wrap = document.getElementById(containerId);
  wrap.innerHTML = `<div class="skeleton skel-row"></div><div class="skeleton skel-row"></div>`;

  const { data, error } = await supabaseClient
    .from("transactions")
    .select("*")
    .eq("type", type)
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error);
    wrap.innerHTML = `<div class="state-block state-error"><div class="state-icon">${ICON_ALERT_LG}</div><h4>We couldn't load pending ${type}s</h4><p>Please try again.</p><button type="button" class="btn btn-ghost btn-sm" data-retry-type="${type}">Try again</button></div>`;
    wrap.querySelector("[data-retry-type]")?.addEventListener("click", () => loadPendingTxOfType(type, containerId));
    return;
  }
  if (!data || data.length === 0) {
    wrap.innerHTML = `<div class="state-block"><div class="state-icon">${ICON_CHECK_LG}</div><h4>All caught up</h4><p>No ${type}s are waiting for review.</p></div>`;
    return;
  }

  wrap.innerHTML = data.map((t) => pendingTxCardHtml(t, type)).join("");

  wrap.querySelectorAll(".approve-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.closest(".transfer-card").dataset.id;
      confirmModal({
        title: `Approve this ${type}?`,
        body: type === "deposit"
          ? "The customer's balance will increase immediately."
          : "The customer's balance will decrease immediately.",
        confirmLabel: "Approve",
        onConfirm: () => approvePendingTx(id, type)
      });
    });
  });
  wrap.querySelectorAll(".reject-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.closest(".transfer-card").dataset.id;
      openRejectModal({
        title: `Reason for rejecting this ${type}`,
        confirmLabel: `Reject ${type}`,
        onReject: (reason) => rejectPendingTx(id, type, reason)
      });
    });
  });
}

function pendingTxCardHtml(t, type) {
  const account = accountsById[t.account_id];
  const profile = account ? profilesById[account.user_id] : null;
  return `
    <div class="transfer-card" data-id="${t.id}">
      <div class="tc-top">
        <span class="badge badge-pending">pending</span>
        <span class="tc-amt mono">${displayCurrency(t.amount)}</span>
      </div>
      <div class="tc-parties">
        <div class="tc-party">
          <div class="p-label">Customer</div>
          <div class="p-name">${escapeHtml(profile ? profile.first_name + " " + profile.last_name : "Unknown")}</div>
          <div class="p-acct">${escapeHtml(profile?.email || "")}</div>
          <div class="p-acct">${formatAccountNumber(account?.account_number)}</div>
        </div>
      </div>
      <div class="tc-desc">${escapeHtml(t.description || "No description provided.")}</div>
      <div class="tc-date">${formatDateTime(t.created_at)}</div>
      <div class="tc-actions">
        <button class="btn btn-primary btn-sm approve-btn">Approve</button>
        <button class="btn btn-danger btn-sm reject-btn">Reject</button>
      </div>
    </div>`;
}

async function approvePendingTx(id, type) {
  const rpcName = type === "deposit" ? "admin_approve_deposit" : "admin_approve_withdrawal";
  try {
    const { error } = await supabaseClient.rpc(rpcName, { p_transaction_id: id });
    if (error) throw error;
    showToast(`${capitalize(type)} approved.`, "success");
    await refreshAfterAction();
  } catch (err) {
    console.error(err);
    showToast(friendlyError(err, `We couldn't approve this ${type}.`), "error");
    await refreshAfterAction();
  }
}

async function rejectPendingTx(id, type, reason) {
  const rpcName = type === "deposit" ? "admin_reject_deposit" : "admin_reject_withdrawal";
  try {
    const { error } = await supabaseClient.rpc(rpcName, { p_transaction_id: id, p_rejection_reason: reason });
    if (error) throw error;
    showToast(`${capitalize(type)} rejected.`, "success");
    await refreshAfterAction();
  } catch (err) {
    console.error(err);
    showToast(friendlyError(err, `We couldn't reject this ${type}.`), "error");
  }
}

async function refreshAfterAction() {
  await loadLookups();
  await Promise.all([
    loadOverview(),
    loadPendingDeposits(),
    loadPendingWithdrawals(),
    loadPendingTransfers(),
    loadCustomers(),
    loadAllTransactions()
  ]);
}

function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

/* ---------- Customer management ---------- */
async function loadCustomers() {
  const wrap = document.getElementById("customers-wrap");
  const customers = Object.values(profilesById)
    .filter((p) => p.role !== "admin")
    .map((p) => ({ profile: p, account: accountsByUserId[p.id] }));

  if (customers.length === 0) {
    wrap.innerHTML = `<div class="state-block"><div class="state-icon">${ICON_USERS}</div><h4>No customers yet</h4><p>New sign-ups will appear here.</p></div>`;
    return;
  }

  wrap.innerHTML = `
    <div class="table-wrap">
      <table class="data-table">
        <thead><tr><th>Name</th><th>Email</th><th>Account number</th><th>Balance</th><th>Status</th><th>Registered</th></tr></thead>
        <tbody>
          ${customers.map(({ profile, account }) => `
            <tr>
              <td data-label="Name">${escapeHtml(profile.first_name)} ${escapeHtml(profile.last_name)}</td>
              <td data-label="Email">${escapeHtml(profile.email)}</td>
              <td data-label="Account number" class="mono">${account ? formatAccountNumber(account.account_number) : "—"}</td>
              <td data-label="Balance" class="mono">${account ? displayCurrency(account.balance) : "—"}</td>
              <td data-label="Status">${account ? `<span class="badge badge-${(account.account_status||"active").toLowerCase()}">${account.account_status}</span>` : "—"}</td>
              <td data-label="Registered">${formatDate(profile.created_at)}</td>
            </tr>`).join("")}
        </tbody>
      </table>
    </div>`;
}

/* ---------- Transaction monitoring ---------- */
let allTransactions = [];

async function loadAllTransactions() {
  const wrap = document.getElementById("admin-tx-wrap");
  wrap.innerHTML = `<div class="skeleton skel-row"></div><div class="skeleton skel-row"></div>`;

  const { data, error } = await supabaseClient
    .from("transactions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(300);

  if (error) {
    console.error(error);
    wrap.innerHTML = `<div class="state-block state-error"><div class="state-icon">${ICON_ALERT_LG}</div><h4>We couldn't load transactions</h4><p>Please try again.</p><button type="button" class="btn btn-ghost btn-sm" id="admin-tx-retry-btn">Try again</button></div>`;
    document.getElementById("admin-tx-retry-btn")?.addEventListener("click", loadAllTransactions);
    return;
  }
  allTransactions = data || [];
  renderAdminTransactions(allTransactions);
}

function renderAdminTransactions(list) {
  const wrap = document.getElementById("admin-tx-wrap");
  if (list.length === 0) {
    wrap.innerHTML = `<div class="state-block"><div class="state-icon">${ICON_SEARCH}</div><h4>No transactions found</h4><p>Try adjusting your filters.</p></div>`;
    return;
  }
  wrap.innerHTML = `
    <div class="table-wrap">
      <table class="data-table">
        <thead><tr><th>Date</th><th>Customer</th><th>Type</th><th>Description</th><th>Amount</th><th>Status</th></tr></thead>
        <tbody>
          ${list.map((t) => {
            const account = accountsById[t.account_id];
            const profile = account ? profilesById[account.user_id] : null;
            return `<tr>
              <td data-label="Date">${formatDate(t.created_at)}</td>
              <td data-label="Customer">${profile ? escapeHtml(profile.first_name + " " + profile.last_name) : "—"}</td>
              <td data-label="Type">${capitalize(t.type)}</td>
              <td data-label="Description">${escapeHtml(t.description || "—")}</td>
              <td data-label="Amount" class="mono">${displayCurrency(t.amount)}</td>
              <td data-label="Status"><span class="badge badge-${t.status}">${t.status}</span></td>
            </tr>`;
          }).join("")}
        </tbody>
      </table>
    </div>`;
}

function bindTransactionFilters() {
  const typeSel = document.getElementById("admin-tx-type");
  const statusSel = document.getElementById("admin-tx-status");
  const apply = () => {
    const type = typeSel.value;
    const status = statusSel.value;
    const filtered = allTransactions.filter((t) => (!type || t.type === type) && (!status || t.status === status));
    renderAdminTransactions(filtered);
  };
  typeSel.addEventListener("change", apply);
  statusSel.addEventListener("change", apply);
}
