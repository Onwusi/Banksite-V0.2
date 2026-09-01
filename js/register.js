/* ==========================================================================
   NexaBank — Registration
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("register-form");
  if (!form) return;
  const submitBtn = document.getElementById("register-submit");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearErrors(form);

    const firstName = form.first_name.value.trim();
    const lastName = form.last_name.value.trim();
    const email = form.email.value.trim();
    const phone = form.phone.value.trim();
    const password = form.password.value;
    const confirmPassword = form.confirm_password.value;
    const pin = form.pin.value.trim();
    const confirmPin = form.confirm_pin.value.trim();
    const state = form.state.value.trim();
    const country = form.country.value.trim();

    let hasError = false;
    const required = { first_name: firstName, last_name: lastName, email, phone, state, country };
    for (const [field, val] of Object.entries(required)) {
      if (!val) { setError(form, field, "This field is required."); hasError = true; }
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) { setError(form, "email", "Enter a valid email address."); hasError = true; }
    if (password.length < 8) { setError(form, "password", "Password must be at least 8 characters."); hasError = true; }
    if (password !== confirmPassword) { setError(form, "confirm_password", "Passwords do not match."); hasError = true; }
    if (!/^\d{4}$/.test(pin)) { setError(form, "pin", "PIN must be exactly 4 digits."); hasError = true; }
    if (pin !== confirmPin) { setError(form, "confirm_pin", "PINs do not match."); hasError = true; }

    if (hasError) return;

    setButtonLoading(submitBtn, true, "Creating account…");
    try {
      // 1. Create the Auth user. The existing DB trigger creates the profile row
      //    from these metadata fields (first_name, last_name, phone, state, country).
      const { data: signUpData, error: signUpError } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: { first_name: firstName, last_name: lastName, phone, state, country }
        }
      });
      if (signUpError) throw signUpError;

      if (!signUpData.session) {
        // Email confirmation is required before a session exists.
        showToast("Account created. Check your email to confirm before signing in.", "success", 6000);
        setTimeout(() => (window.location.href = "login.html"), 1500);
        return;
      }

      // 2. Create the user's account (10-digit account number) via a secure RPC.
      //    Requires the `ensure_account()` function described in /sql/setup.sql.
      const { error: acctError } = await supabaseClient.rpc("ensure_account");
      if (acctError) {
        console.error(acctError);
        showToast("Signed up, but account setup needs a backend function (see README).", "warn", 7000);
      }

      // 3. Store the transaction PIN — hashed, server-side, via set_pin().
      //    Requires the `set_pin()` function described in /sql/setup.sql.
      const { error: pinError } = await supabaseClient.rpc("set_pin", { p_pin: pin });
      if (pinError) {
        console.error(pinError);
        showToast("Signed up, but PIN setup needs a backend function (see README).", "warn", 7000);
      }

      showToast("Welcome to NexaBank.", "success");
      setTimeout(() => (window.location.href = "dashboard.html"), 900);
    } catch (err) {
      console.error(err);
      showToast(friendlyError(err, "We couldn't create your account. Please try again."), "error");
    } finally {
      setButtonLoading(submitBtn, false);
    }
  });

  // step-like UX: live PIN digit formatting
  ["pin", "confirm_pin"].forEach((name) => {
    const el = form.elements[name];
    if (el) el.addEventListener("input", () => { el.value = el.value.replace(/\D/g, "").slice(0, 4); });
  });
});

function setError(form, field, message) {
  const wrap = form.querySelector(`[data-field="${field}"]`);
  if (!wrap) return;
  wrap.classList.add("has-error");
  const err = wrap.querySelector(".err-msg");
  if (err) err.textContent = message;
}
function clearErrors(form) {
  form.querySelectorAll(".field.has-error").forEach((f) => f.classList.remove("has-error"));
}
