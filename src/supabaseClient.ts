import { createClient } from "@supabase/supabase-js";

// REPLACE THESE WITH YOUR ACTUAL SUPABASE CREDENTIALS
const SUPABASE_URL = "https://dlwdrnswmvanmzaoiggp.supabase.co";
const SUPABASE_PUBLIC_KEY = "sb_publishable_xOGXPbX4hCKKRwDqqcjkGQ_RVLtlg_-";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
