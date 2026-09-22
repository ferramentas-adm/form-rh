import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(url, anonKey);

// Client espelhado pro backend self-hosted na Oracle -- ainda não é produção,
// então só usado pra escrita em paralelo/best-effort (ver TalentoForm.tsx).
// Assim que Oracle virar produção de fato, troca as env vars acima e remove isso.
const oracleUrl =
  (import.meta.env.VITE_ORACLE_SUPABASE_URL as string) ||
  "https://api.204.216.147.185.nip.io";
const oracleAnonKey =
  (import.meta.env.VITE_ORACLE_SUPABASE_ANON_KEY as string) ||
  "sb_publishable_9oHByHIfG1I8GPHq6V6YTG_gdTgkOLS";

export const supabaseOracle = createClient(oracleUrl, oracleAnonKey);
