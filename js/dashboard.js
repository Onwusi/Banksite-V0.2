/* ==========================================================================
   NexaBank — Dashboard
   ========================================================================== */

let currentProfile = null;
let currentAccount = null;

document.addEventListener("DOMContentLoaded", async () => {
  const session = await requireSession();
  if (!session) return;

  try {
    currentProfile = await getProfile(session.user.id);
    currentAccount = await getAccount(session.user.id);
  } catch (err) {
    console.error(err);
    renderErrorState();
    return;
  }

  renderSidebar("dashboard", {
    name: `${currentProfile.first_name} ${currentProfile.last_name}`,
    initials: initials(currentProfile.first_name, currentProfile.last_name),
    isAdmin: currentProfile.role === "admin"
  });

  document.getElementById("welcome-name").textContent = currentProfile.first_name;
  renderBalanceCard();
  bindBalanceToggle(document.getElementById("balance-eye"), renderBalanceCard);
  await loadStatsAndTransactions();

  if (location.hash === "#deposit") openModal("deposit-modal");
  if (location.hash === "#withdraw") openModal("withdraw-modal");

  bindModals();
});

function renderBalanceCard() {
  document.getElementById("balance-amount").textContent = displayCurrency(currentAccount.balance);
  document.getElementById("balance-acct").textContent = formatAccountNumber(currentAccount.account_number);
  const statusEl = document.getElementById("balance-status");
  statusEl.textContent = currentAccount.account_status;
  statusEl.className = "badge badge-" + (currentAccount.account_status || "active").toLowerCase();
}

async function loadStatsAndTransactions() {
  const listEl = document.getElementById("tx-list");
  listEl.innerHTML = skeletonRows(4);

  const { data: txs, error } = await supabaseClient
    .from("transactions")
    .select("*")
    .eq("account_id", currentAccount.id)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error(error);
    listEl.innerHTML = errorState("We couldn't load your transactions.");
    document.getElementById("tx-retry-btn")?.addEventListener("click", loadStatsAndTransactions);
    return;
  }

  // Totals — only completed transactions count. Pending deposits/withdrawals
  // (awaiting admin approval) intentionally do not affect these figures.
  let deposits = 0, withdrawals = 0, transfers = 0;
  txs.forEach((t) => {
    if (t.status !== "completed") return;
    const amt = Number(t.amount);
    if (t.type === "deposit") deposits += amt;
    else if (t.type === "withdrawal") withdrawals += amt;
    else if (t.type === "transfer") transfers += amt;
  });
  document.getElementById("stat-deposits").textContent = displayCurrency(deposits);
  document.getElementById("stat-withdrawals").textContent = displayCurrency(withdrawals);
  document.getElementById("stat-transfers").textContent = displayCurrency(transfers);

  // Recent list (top 6)
  const recent = txs.slice(0, 6);
  if (recent.length === 0) {
    listEl.innerHTML = emptyState("No transactions yet", "Your activity will show up here once you deposit, withdraw, or transfer.");
    return;
  }
  listEl.innerHTML = recent.map(txRowHtml).join("");
}

function txRowHtml(t) {
  const iconClass = t.type === "deposit" ? "dep" : t.type === "withdrawal" ? "wd" : "xfer";
  const icon = t.type === "deposit" ? ICON_ARROW_DOWN : t.type === "withdrawal" ? ICON_ARROW_UP : ICON_TRANSFER;
  const sign = t.type === "deposit" ? "+" : "-";
  const amtClass = t.type === "deposit" ? "pos" : "neg";
  const pendingNote = t.status === "pending" ? " · Awaiting admin approval" : "";
  return `
    <div class="tx-row">
      <div class="tx-ic ${iconClass}">${icon}</div>
      <div class="tx-main">
        <div class="t1">${escapeHtml(t.description || capitalize(t.type))}</div>
        <div class="t2">${formatDateTime(t.created_at)} · <span class="badge badge-${t.status}">${t.status}</span>${pendingNote}</div>
      </div>
      <div class="tx-amt ${amtClass}">${sign}${displayCurrency(t.amount)}</div>
    </div>`;
}

function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

function skeletonRows(n) {
  return Array.from({ length: n }).map(() => `<div class="skeleton skel-row"></div>`).join("");
}
function emptyState(title, sub) {
  return `<div class="state-block"><div class="state-icon">${ICON_INBOX}</div><h4>${escapeHtml(title)}</h4><p>${escapeHtml(sub)}</p></div>`;
}
function errorState(msg) {
  return `<div class="state-block state-error"><div class="state-icon">${ICON_ALERT_LG}</div><h4>We couldn't load this</h4><p>${escapeHtml(msg)}</p><button type="button" class="btn btn-ghost btn-sm" id="tx-retry-btn">Try again</button></div>`;
}
function renderErrorState() {
  document.querySelector(".page").innerHTML = `<div class="state-block state-error"><div class="state-icon">${ICON_ALERT_LG}</div><h4>We couldn't load your dashboard</h4><p>Please try again, or sign in again if the problem continues.</p><button type="button" class="btn btn-primary btn-sm" onclick="location.reload()">Try again</button></div>`;
}

/* ---------- Deposit / Withdraw ----------
   Both now create a PENDING transaction only. Balance changes only after
   an admin approves the request — see admin_approve_deposit() /
   admin_approve_withdrawal() in /sql/pending_transactions.sql. Neither
   function here ever writes to accounts.balance directly.
------------------------------------------------------------------------- */
function bindModals() {
  document.getElementById("open-deposit").addEventListener("click", () => openModal("deposit-modal"));
  document.getElementById("open-withdraw").addEventListener("click", () => openModal("withdraw-modal"));
  document.querySelectorAll("[data-close-modal]").forEach((btn) => {
    btn.addEventListener("click", () => closeModal(btn.dataset.closeModal));
  });

  const depositForm = document.getElementById("deposit-form");
  depositForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const amount = parseFloat(depositForm.amount.value);
    const description = depositForm.description.value.trim() || "Deposit";
    if (!amount || amount <= 0) { showToast("Enter a valid deposit amount.", "error"); return; }

    const btn = depositForm.querySelector("button[type=submit]");
    setButtonLoading(btn, true, "Submitting…");
    try {
      // Requires the `request_deposit()` SECURITY DEFINER function — see
      // /sql/pending_transactions.sql. Creates a pending transaction only;
      // balance is untouched until an admin approves it.
      const { error } = await supabaseClient.rpc("request_deposit", { p_amount: amount, p_description: description });
      if (error) throw error;
      showToast("Deposit submitted for admin approval.", "success");
      closeModal("deposit-modal");
      depositForm.reset();
      await loadStatsAndTransactions();
    } catch (err) {
      console.error(err);
      showToast(friendlyError(err, "We couldn't submit your deposit. Please try again."), "error");
    } finally {
      setButtonLoading(btn, false);
    }
  });

  const withdrawForm = document.getElementById("withdraw-form");
  withdrawForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const amount = parseFloat(withdrawForm.amount.value);
    if (!amount || amount <= 0) { showToast("Enter a valid withdrawal amount.", "error"); return; }
    if (amount > Number(currentAccount.balance)) { showToast("Insufficient funds.", "error"); return; }

    closeModal("withdraw-modal");
    const pin = await collectPin();
    if (!pin) return;

    const btn = withdrawForm.querySelector("button[type=submit]");
    setButtonLoading(btn, true, "Submitting…");
    try {
      // Requires the `request_withdrawal()` SECURITY DEFINER function — see
      // /sql/pending_transactions.sql. It verifies the PIN and checks the
      // balance server-side, but only creates a pending transaction; the
      // actual debit happens in admin_approve_withdrawal().
      const { error } = await supabaseClient.rpc("request_withdrawal", {
        p_amount: amount,
        p_description: "Withdrawal",
        p_pin: pin
      });
      if (error) throw error;
      showToast("Withdrawal submitted for admin approval.", "success");
      withdrawForm.reset();
      await loadStatsAndTransactions();
    } catch (err) {
      console.error(err);
      showToast(friendlyError(err, "We couldn't submit your withdrawal. Please try again."), "error");
    } finally {
      setButtonLoading(btn, false);
    }
  });
}
