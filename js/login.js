/* ==========================================================================
   NexaBank — Login
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  if (!form) return;
  const submitBtn = document.getElementById("login-submit");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = form.email.value.trim();
    const password = form.password.value;

    if (!email || !password) {
      showToast("Enter your email and password.", "error");
      return;
    }

    setButtonLoading(submitBtn, true, "Signing in…");
    try {
      const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) throw error;
      showToast("Welcome back.", "success");
      setTimeout(() => (window.location.href = "dashboard.html"), 500);
    } catch (err) {
      console.error(err);
      showToast(friendlyError(err, "We couldn't sign you in. Please try again."), "error");
    } finally {
      setButtonLoading(submitBtn, false);
    }
  });
});
