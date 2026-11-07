import { createClient } from "@supabase/supabase-js";

// Supabase Cloud (projeto `intranet`) -- única produção desde 07/11/2026.
// Chave anon: pública por natureza, protegida por RLS.
const url = import.meta.env.VITE_SUPABASE_URL as string;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(url, anonKey);
