import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv } from "./config";

const { url, anonKey } = getSupabasePublicEnv();

export const supabaseBrowser = createClient(url, anonKey);
