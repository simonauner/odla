import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
if (!url || !key) throw new Error("VITE_SUPABASE_URL och VITE_SUPABASE_PUBLISHABLE_KEY saknas (se .env)");

export const supabase = createClient<Database>(url, key);
