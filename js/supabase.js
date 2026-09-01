/* ==========================================================================
   NexaBank — Supabase client
   Publishable (anon) key only. Never place a secret/service-role key here.
   ========================================================================== */

const SUPABASE_URL = "https://otnevlinxzrwagqwgifx.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_NkzI73JgYVii5TWym1PikA_iI8jRytt";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: "nexabank-auth"
    }
  }
);
