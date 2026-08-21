import { useEffect, useState } from "react";
import logo from "./assets/logo-grupo-silva.png";
import { supabase } from "./supabaseClient";
import { Eyebrow } from "./ui";

type Vaga = {
  id: string;
  titulo: string;
  setor: string | null;
  tipo_contrato: string | null;
  created_at: string;
};

export default function VagasPage() {
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("vagas_publicas")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setVagas((data as Vaga[]) || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-2xl mx-auto space-y-8">
        <a href="/" className="text-xs text-neutral-500 hover:text-neutral-300">← Voltar</a>
        <div className="text-center space-y-2">
          <img src={logo} alt="Grupo Silva" className="h-10 mx-auto" />
          <Eyebrow>Grupo Silva</Eyebrow>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Vagas Abertas</h1>
          <p className="text-sm text-neutral-400">
            Confira as oportunidades disponíveis no Grupo Silva agora.
          </p>
        </div>

        {loading ? (
          <p className="text-center text-sm text-neutral-500">Carregando vagas...</p>
        ) : error ? (
          <p className="text-center text-sm text-red-400">Não foi possível carregar as vagas agora.</p>
        ) : vagas.length === 0 ? (
          <div className="text-center bg-[#121212]/80 border border-white/10 rounded-2xl p-8 space-y-3">
            <p className="text-sm text-neutral-400">Nenhuma vaga aberta no momento.</p>
            <p className="text-xs text-neutral-500">
              Mas você pode deixar seu perfil registrado no nosso{" "}
              <a href="/talentos.html" className="text-brand hover:underline">Banco de Talentos</a> — assim que
              surgir uma oportunidade compatível, entramos em contato.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {vagas.map((v) => (
              <div key={v.id} className="bg-[#121212]/80 border border-white/10 rounded-2xl p-5 flex items-center justify-between gap-4 hover:border-brand/40 transition">
                <div className="space-y-1.5 min-w-0">
                  <h2 className="text-white font-medium">{v.titulo}</h2>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[11px] text-brand bg-brand/10 border border-brand/20 rounded-full px-2 py-0.5">
                      {v.setor || "Setor não informado"}
                    </span>
                    {v.tipo_contrato && (
                      <span className="text-[11px] text-neutral-400 bg-white/5 border border-white/10 rounded-full px-2 py-0.5">
                        {v.tipo_contrato}
                      </span>
                    )}
                  </div>
                </div>
                <a
                  href={`/talentos.html?area=${encodeURIComponent(v.setor || "")}&vaga_id=${encodeURIComponent(v.id)}&vaga_titulo=${encodeURIComponent(v.titulo)}`}
                  className="shrink-0 bg-brand text-black text-sm font-semibold rounded-lg px-4 py-2 hover:brightness-110 transition"
                >
                  Candidatar-se
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
