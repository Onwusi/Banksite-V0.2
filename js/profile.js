/* ==========================================================================
   NexaBank — Profile & settings
   ========================================================================== */

let pProfile = null;
let pAccount = null;
let pUserId = null;
let hasPin = false; // true = PIN already configured (Change flow), false = first-time setup
let pinSubmitting = false; // guards against double submission

document.addEventListener("DOMContentLoaded", async () => {
  const session = await requireSession();
  if (!session) return;
  pUserId = session.user.id;

  await loadProfileAndAccount();
});

async function loadProfileAndAccount() {
  showProfileSkeleton();
  try {
    pProfile = await getProfile(pUserId);
    pAccount = await getAccount(pUserId);
  } catch (err) {
    console.error(err);
    showProfileError();
    return;
  }

  renderSidebar("profile", {
    name: `${pProfile.first_name} ${pProfile.last_name}`,
    initials: initials(pProfile.first_name, pProfile.last_name),
    isAdmin: pProfile.role === "admin"
  });

  renderProfile();
  bindEditForm();
  await initPinSection();

  if (location.hash === "#settings") {
    document.getElementById("settings-card")?.scrollIntoView({ behavior: "smooth" });
  }
}

function showProfileSkeleton() {
  const grid = document.getElementById("profile-view");
  grid.innerHTML = Array.from({ length: 9 }).map(() => `
    <div class="profile-field">
      <div class="skeleton skel-line" style="width:45%;"></div>
      <div class="skeleton skel-line" style="width:75%;margin-bottom:0;"></div>
    </div>`).join("");
}

function showProfileError() {
  const grid = document.getElementById("profile-view");
  grid.innerHTML = `<div class="state-block state-error" style="grid-column:1/-1;"><div class="state-icon">${ICON_ALERT_LG}</div><h4>We couldn't load your profile</h4><p>Please try again.</p><button type="button" class="btn btn-ghost btn-sm" id="profile-retry-btn">Try again</button></div>`;
  document.getElementById("profile-retry-btn")?.addEventListener("click", loadProfileAndAccount);
}

function renderProfile() {
  document.getElementById("profile-view").innerHTML = `
    <div class="profile-field"><div class="k">First name</div><div class="v" id="view-first">—</div></div>
    <div class="profile-field"><div class="k">Last name</div><div class="v" id="view-last">—</div></div>
    <div class="profile-field"><div class="k">Email</div><div class="v" id="view-email">—</div></div>
    <div class="profile-field"><div class="k">Phone</div><div class="v" id="view-phone">—</div></div>
    <div class="profile-field"><div class="k">State</div><div class="v" id="view-state">—</div></div>
    <div class="profile-field"><div class="k">Country</div><div class="v" id="view-country">—</div></div>
    <div class="profile-field"><div class="k">Account number</div><div class="v mono" id="view-account">—</div></div>
    <div class="profile-field"><div class="k">Account status</div><div class="v"><span class="badge" id="view-status">active</span></div></div>
    <div class="profile-field"><div class="k">Member since</div><div class="v" id="view-since">—</div></div>`;

  document.getElementById("view-first").textContent = pProfile.first_name || "—";
  document.getElementById("view-last").textContent = pProfile.last_name || "—";
  document.getElementById("view-email").textContent = pProfile.email || "—";
  document.getElementById("view-phone").textContent = pProfile.phone || "—";
  document.getElementById("view-state").textContent = pProfile.state || "—";
  document.getElementById("view-country").textContent = pProfile.country || "—";
  document.getElementById("view-account").textContent = formatAccountNumber(pAccount.account_number);
  const statusEl = document.getElementById("view-status");
  statusEl.textContent = pAccount.account_status;
  statusEl.className = "badge badge-" + (pAccount.account_status || "active").toLowerCase();
  document.getElementById("view-since").textContent = formatDate(pProfile.created_at, { year: "numeric", month: "long" });

  const editForm = document.getElementById("edit-form");
  editForm.first_name.value = pProfile.first_name || "";
  editForm.last_name.value = pProfile.last_name || "";
  editForm.phone.value = pProfile.phone || "";
  editForm.state.value = pProfile.state || "";
  editForm.country.value = pProfile.country || "";
}

function bindEditForm() {
  const editForm = document.getElementById("edit-form");
  const editToggle = document.getElementById("toggle-edit");
  const viewBlock = document.getElementById("profile-view");
  const editBlock = document.getElementById("profile-edit");

  editToggle.addEventListener("click", () => {
    viewBlock.style.display = viewBlock.style.display === "none" ? "grid" : "none";
    editBlock.style.display = editBlock.style.display === "none" ? "block" : "none";
  });
  document.getElementById("cancel-edit").addEventListener("click", () => {
    viewBlock.style.display = "grid";
    editBlock.style.display = "none";
    renderProfile();
  });

  editForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = editForm.querySelector("button[type=submit]");
    setButtonLoading(btn, true, "Saving…");
    try {
      const updates = {
        first_name: editForm.first_name.value.trim(),
        last_name: editForm.last_name.value.trim(),
        phone: editForm.phone.value.trim(),
        state: editForm.state.value.trim(),
        country: editForm.country.value.trim()
      };
      // Note: role and email are intentionally not editable from the client.
      const { error } = await supabaseClient.from("profiles").update(updates).eq("id", pUserId);
      if (error) throw error;
      pProfile = { ...pProfile, ...updates };
      renderProfile();
      viewBlock.style.display = "grid";
      editBlock.style.display = "none";
      showToast("Profile updated.", "success");
    } catch (err) {
      console.error(err);
      showToast(friendlyError(err, "We couldn't save your changes. Please try again."), "error");
    } finally {
      setButtonLoading(btn, false);
    }
  });
}

/* ==========================================================================
   PIN setup / change
   Determines, on load, whether the authenticated user already has a PIN
   configured (profiles.pin_hash IS NOT NULL) and renders the matching flow.
   pin_hash itself is only ever inspected in-memory to compute a boolean —
   it is never rendered, logged, or persisted anywhere on the client.
   ========================================================================== */

async function initPinSection() {
  try {
    hasPin = await fetchHasPin(pUserId);
  } catch (err) {
    console.error(err);
    document.getElementById("pin-section").innerHTML =
      `<div class="state-block state-error" style="padding:20px 0;"><h4>Couldn't load PIN status</h4><p>Refresh the page to try again.</p></div>`;
    return;
  }
  renderPinSection();
}

async function fetchHasPin(userId) {
  // Select only pin_hash — never selected elsewhere, never rendered, and
  // the value itself is discarded immediately after this boolean check.
  const { data, error } = await supabaseClient
    .from("profiles")
    .select("pin_hash")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data.pin_hash !== null && data.pin_hash !== undefined;
}

function renderPinSection() {
  const titleEl = document.getElementById("pin-section-title");
  const subEl = document.getElementById("pin-section-sub");
  const wrap = document.getElementById("pin-section");

  if (hasPin) {
    titleEl.textContent = "Change Transaction PIN";
    subEl.textContent = "Confirm your current PIN, then choose a new one.";
    wrap.innerHTML = `
      <form id="pin-form" novalidate>
        <div class="field" data-field="current_pin">
          ${pinFieldLabel("Current PIN", "current_pin")}
          <div class="pin-inputs" data-group="current_pin">
            ${pinDigitInputs("current_pin")}
          </div>
          <div class="err-msg"></div>
        </div>
        <div class="field" data-field="new_pin">
          ${pinFieldLabel("New PIN", "new_pin")}
          <div class="pin-inputs" data-group="new_pin">
            ${pinDigitInputs("new_pin")}
          </div>
          <div class="err-msg"></div>
        </div>
        <div class="field" data-field="confirm_pin">
          ${pinFieldLabel("Confirm new PIN", "confirm_pin")}
          <div class="pin-inputs" data-group="confirm_pin">
            ${pinDigitInputs("confirm_pin")}
          </div>
          <div class="err-msg"></div>
        </div>
        <div class="flex gap-12">
          <button type="button" class="btn btn-ghost" id="pin-form-cancel">Clear</button>
          <button type="submit" class="btn btn-primary" id="pin-form-submit">Change PIN</button>
        </div>
      </form>`;
  } else {
    titleEl.textContent = "Create Transaction PIN";
    subEl.textContent = "Set a 4-digit PIN to authorize withdrawals and transfers.";
    wrap.innerHTML = `
      <form id="pin-form" novalidate>
        <div class="field" data-field="new_pin">
          ${pinFieldLabel("Enter New PIN", "new_pin")}
          <div class="pin-inputs" data-group="new_pin">
            ${pinDigitInputs("new_pin")}
          </div>
          <div class="err-msg"></div>
        </div>
        <div class="field" data-field="confirm_pin">
          ${pinFieldLabel("Confirm New PIN", "confirm_pin")}
          <div class="pin-inputs" data-group="confirm_pin">
            ${pinDigitInputs("confirm_pin")}
          </div>
          <div class="err-msg"></div>
        </div>
        <div class="flex gap-12">
          <button type="button" class="btn btn-ghost" id="pin-form-cancel">Clear</button>
          <button type="submit" class="btn btn-primary" id="pin-form-submit">Create PIN</button>
        </div>
      </form>`;
  }

  bindPinFormEvents();
  initEyeToggles(wrap);
}

function pinFieldLabel(text, groupName) {
  return `<div class="field-label-row">
    <label>${escapeHtml(text)}</label>
    <button type="button" class="eye-btn" data-toggle-group="${groupName}" aria-label="Show PIN"></button>
  </div>`;
}

function pinDigitInputs(groupName) {
  return [0, 1, 2, 3]
    .map((i) => `<input type="password" inputmode="numeric" pattern="[0-9]" maxlength="1" autocomplete="off" data-group="${groupName}" data-i="${i}" />`)
    .join("");
}

function bindPinFormEvents() {
  const form = document.getElementById("pin-form");
  if (!form) return;

  // Auto-advance / backspace handling + digits-only enforcement for every PIN group.
  form.querySelectorAll(".pin-inputs").forEach((group) => {
    const inputs = [...group.querySelectorAll("input")];
    inputs.forEach((inp, idx) => {
      inp.addEventListener("input", () => {
        inp.value = inp.value.replace(/\D/g, "").slice(0, 1);
        if (inp.value && inputs[idx + 1]) inputs[idx + 1].focus();
      });
      inp.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" && !inp.value && inputs[idx - 1]) inputs[idx - 1].focus();
      });
    });
  });

  document.getElementById("pin-form-cancel").addEventListener("click", () => {
    clearPinFieldErrors(form);
    form.reset();
    form.querySelectorAll(".pin-inputs input").forEach((i) => (i.value = ""));
    const firstGroup = form.querySelector(".pin-inputs");
    firstGroup?.querySelector("input")?.focus();
  });

  form.addEventListener("submit", handlePinSubmit);
}

function readPinGroup(form, groupName) {
  return [...form.querySelectorAll(`.pin-inputs[data-group="${groupName}"] input`)]
    .map((i) => i.value)
    .join("");
}

function setPinFieldError(form, field, message) {
  const wrap = form.querySelector(`[data-field="${field}"]`);
  if (!wrap) return;
  wrap.classList.add("has-error");
  const err = wrap.querySelector(".err-msg");
  if (err) err.textContent = message;
}
function clearPinFieldErrors(form) {
  form.querySelectorAll(".field.has-error").forEach((f) => {
    f.classList.remove("has-error");
    const err = f.querySelector(".err-msg");
    if (err) err.textContent = "";
  });
}

async function handlePinSubmit(e) {
  e.preventDefault();
  if (pinSubmitting) return; // guard against double submission

  const form = e.target;
  clearPinFieldErrors(form);

  const newPin = readPinGroup(form, "new_pin");
  const confirmPin = readPinGroup(form, "confirm_pin");
  const currentPin = hasPin ? readPinGroup(form, "current_pin") : null;

  let hasError = false;
  if (hasPin && !/^\d{4}$/.test(currentPin)) {
    setPinFieldError(form, "current_pin", "Enter your current 4-digit PIN.");
    hasError = true;
  }
  if (!/^\d{4}$/.test(newPin)) {
    setPinFieldError(form, "new_pin", "PIN must be exactly 4 digits.");
    hasError = true;
  }
  if (!/^\d{4}$/.test(confirmPin)) {
    setPinFieldError(form, "confirm_pin", "Please confirm your new PIN.");
    hasError = true;
  }
  if (!hasError && newPin !== confirmPin) {
    setPinFieldError(form, "confirm_pin", "PINs do not match.");
    hasError = true;
  }
  if (!hasError && hasPin && currentPin === newPin) {
    setPinFieldError(form, "new_pin", "New PIN must be different from your current PIN.");
    hasError = true;
  }
  if (hasError) return;

  const btn = document.getElementById("pin-form-submit");
  pinSubmitting = true;
  setButtonLoading(btn, true, hasPin ? "Changing…" : "Creating…");

  try {
    if (hasPin) {
      // Verify the current PIN server-side before allowing a change.
      const { data: ok, error: verErr } = await supabaseClient.rpc("verify_pin", { p_pin: currentPin });
      if (verErr) throw verErr;
      if (!ok) {
        setPinFieldError(form, "current_pin", "Incorrect current PIN.");
        showToast("Incorrect current PIN.", "error");
        return;
      }
    }

    const { error: setErr } = await supabaseClient.rpc("set_pin", { p_pin: newPin });
    if (setErr) throw setErr;

    showToast(hasPin ? "Transaction PIN changed." : "Transaction PIN created.", "success");

    // Flip straight into "Change PIN" mode without requiring a re-login.
    hasPin = true;
    renderPinSection();
  } catch (err) {
    console.error(err);
      showToast(friendlyError(err, "We couldn't update your PIN. Please try again."), "error");
  } finally {
    pinSubmitting = false;
    setButtonLoading(btn, false);
  }
}
