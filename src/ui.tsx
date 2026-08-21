import type { ReactNode } from "react";

// Peças visuais compartilhadas entre Home/Vagas/Talentos/Ativação -- extraídas pra não
// triplicar o mesmo padrão de hero/tip-box em cada página (inspirado no layout de
// referência: eyebrow + headline com destaque + bullets + tip box antes do formulário).

export const inputClass =
  "w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-brand";

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs text-neutral-400">{label}</span>
      {children}
      {hint && <p className="text-[11px] text-amber-400/80 mt-1">{hint}</p>}
    </label>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-xs font-semibold tracking-[0.2em] text-brand uppercase">{children}</p>;
}

export function Bullet({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-center gap-2 text-xs sm:text-sm text-neutral-300">
      <span className="h-1.5 w-1.5 rounded-full bg-brand shrink-0" />
      {children}
    </li>
  );
}

export function TipBox({ lead, children }: { lead: string; children: ReactNode }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-brand/30 bg-brand/10 p-4 text-sm text-neutral-200">
      <span className="text-lg leading-none shrink-0">💡</span>
      <p>
        <strong className="text-brand">{lead}</strong> {children}
      </p>
    </div>
  );
}

// Divisor com rótulo (ex: "SOBRE VOCÊ") separando o bloco de hero/contexto do
// formulário em si -- mesmo padrão do layout de referência.
export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <span className="text-[11px] font-semibold tracking-[0.2em] text-neutral-500 uppercase whitespace-nowrap">{children}</span>
      <span className="h-px flex-1 bg-white/10" />
    </div>
  );
}
