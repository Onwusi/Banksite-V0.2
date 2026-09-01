/* ==========================================================================
   NexaBank — Transfers
   ========================================================================== */

let tfProfile = null;
let tfAccount = null;

document.addEventListener("DOMContentLoaded", async () => {
  const session = await requireSession();
  if (!session) return;

  try {
    tfProfile = await getProfile(session.user.id);
    tfAccount = await getAccount(session.user.id);
  } catch (err) {
    console.error(err);
    showToast("Couldn't load your account.", "error");
    return;
  }

  renderSidebar("transfer", {
    name: `${tfProfile.first_name} ${tfProfile.last_name}`,
    initials: initials(tfProfile.first_name, tfProfile.last_name),
    isAdmin: tfProfile.role === "admin"
  });

  document.getElementById("available-balance").textContent = displayCurrency(tfAccount.balance);

  const form = document.getElementById("transfer-form");
  form.addEventListener("submit", handleTransferSubmit);

  await loadTransferHistory();
});

async function handleTransferSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const recipient = form.recipient.value.trim();
  const amount = parseFloat(form.amount.value);
  const description = form.description.value.trim() || "Transfer";

  if (!/^\d{10}$/.test(recipient)) { showToast("Enter a valid 10-digit account number.", "error"); return; }
  if (!amount || amount <= 0) { showToast("Enter a valid amount.", "error"); return; }
  if (amount > Number(tfAccount.balance)) { showToast("Insufficient funds.", "error"); return; }
  if (recipient === String(tfAccount.account_number)) { showToast("You can't transfer to your own account.", "error"); return; }

  const pin = await collectPin();
  if (!pin) return;

  const btn = form.querySelector("button[type=submit]");
  setButtonLoading(btn, true, "Submitting…");
  try {
    // PIN check happens server-side via verify_pin() — see /sql/setup.sql for the
    // required function, since request_transfer() itself does not accept a PIN.
    const { data: pinOk, error: pinError } = await supabaseClient.rpc("verify_pin", { p_pin: pin });
    if (pinError) throw pinError;
    if (!pinOk) { showToast("Incorrect PIN.", "error"); setButtonLoading(btn, false); return; }

    const { error } = await supabaseClient.rpc("request_transfer", {
      p_recipient_account_number: recipient,
      p_amount: amount,
      p_description: description
    });
    if (error) throw error;

    showToast("Transfer request submitted for admin approval.", "success");
    form.reset();
    await loadTransferHistory();
  } catch (err) {
    console.error(err);
    showToast(friendlyError(err, "We couldn't submit your transfer. Please try again."), "error");
  } finally {
    setButtonLoading(btn, false);
  }
}

async function loadTransferHistory() {
  const wrap = document.getElementById("transfer-history");
  wrap.innerHTML = `<div class="skeleton skel-row"></div><div class="skeleton skel-row"></div><div class="skeleton skel-row"></div>`;

  const { data, error } = await supabaseClient
    .from("transfers")
    .select("*")
    .or(`sender_account_id.eq.${tfAccount.id},recipient_account_id.eq.${tfAccount.id}`)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error(error);
    wrap.innerHTML = `<div class="state-block state-error"><div class="state-icon">${ICON_ALERT_LG}</div><h4>We couldn't load your transfer history</h4><p>Please try again.</p><button type="button" class="btn btn-ghost btn-sm" id="transfer-retry-btn">Try again</button></div>`;
    document.getElementById("transfer-retry-btn")?.addEventListener("click", loadTransferHistory);
    return;
  }
  if (!data || data.length === 0) {
    wrap.innerHTML = `<div class="state-block"><div class="state-icon">${ICON_TRANSFER}</div><h4>No transfers yet</h4><p>Transfers you send or receive will appear here.</p></div>`;
    return;
  }

  wrap.innerHTML = `
    <div class="table-wrap">
      <table class="data-table">
        <thead><tr><th>Direction</th><th>Amount</th><th>Description</th><th>Date</th><th>Status</th></tr></thead>
        <tbody>
          ${data.map((t) => {
            const outgoing = t.sender_account_id === tfAccount.id;
            return `<tr>
              <td data-label="Direction">${outgoing ? "Sent" : "Received"}</td>
              <td data-label="Amount" class="mono">${displayCurrency(t.amount)}</td>
              <td data-label="Description">${escapeHtml(t.description || "—")}</td>
              <td data-label="Date">${formatDate(t.created_at)}</td>
              <td data-label="Status">
                <span class="badge badge-${t.status}">${t.status}</span>
                ${t.status === "rejected" && t.rejection_reason ? `<div class="text-faint" style="margin-top:4px;font-size:12px;">${escapeHtml(t.rejection_reason)}</div>` : ""}
              </td>
            </tr>`;
          }).join("")}
        </tbody>
      </table>
    </div>`;
}
