/* ==========================================================================
   NexaBank — shared logic for public/auth pages
   ========================================================================== */

(async function redirectIfAuthenticated() {
  try {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session && (location.pathname.endsWith("login.html") || location.pathname.endsWith("register.html"))) {
      window.location.href = "dashboard.html";
    }
  } catch (e) {
    /* ignore — Supabase not reachable yet, forms will surface errors */
  }
})();
