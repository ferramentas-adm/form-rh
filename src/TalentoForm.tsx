import { useState } from "react";
import logo from "./assets/logo-grupo-silva.png";
import { supabase } from "./supabaseClient";
import { maskTelefone } from "./masks";
import { CustomSelect } from "./CustomSelect";
import { GlowBackground, Eyebrow, Bullet, TipBox, SectionLabel, Field, inputClass } from "./ui";

// Mesma lista de áreas usada em dh_setores no intranet — mantém consistência com o
// que o RH já vê nos filtros do Banco de Talentos.
const AREAS = [
  "Comercial", "Marketing", "Financeiro", "Operações",
  "Customer Success", "Tecnologia", "Jurídico", "RH",
  "Novos Negócios", "Administrativo",
];

const MAX_FILE_MB = 5;

// Mesma lista de UFs usada no filtro do Banco de Talentos na intranet.
const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

type FormState = {
  nome: string;
  telefone: string;
  email: string;
  estado: string;
  cidade: string;
  linkedin: string;
  instagram: string;
  trajetoria: string;
  area_interesse: string;
  website: string; // honeypot
};

const emptyForm: FormState = {
  nome: "", telefone: "", email: "", estado: "", cidade: "", linkedin: "", instagram: "", trajetoria: "", area_interesse: "", website: "",
};

function readQueryDefaults(): Partial<FormState> {
  const params = new URLSearchParams(window.location.search);
  const area = params.get("area") || "";
  return { area_interesse: AREAS.includes(area) ? area : "" };
}

export default function TalentoForm() {
  const [form, setForm] = useState<FormState>({ ...emptyForm, ...readQueryDefaults() });
  const params = new URLSearchParams(window.location.search);
  const vagaId = params.get("vaga_id");
  const vagaTitulo = params.get("vaga_titulo") || params.get("vaga"); // "vaga" = link antigo, só texto
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && file.size > MAX_FILE_MB * 1024 * 1024) {
      setError(`Arquivo maior que ${MAX_FILE_MB}MB. Envie um currículo mais leve.`);
      e.target.value = "";
      setArquivo(null);
      return;
    }
    setError(null);
    setArquivo(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.website) return; // honeypot — bot, finge sucesso
    if (!form.nome.trim() || !form.telefone || !form.email || !form.estado || !form.cidade.trim()) {
      setError("Nome, telefone, e-mail, estado e cidade são obrigatórios.");
      return;
    }

    setSubmitting(true);
    try {
      let portfolioUrl: string | null = null;

      if (arquivo) {
        const ext = arquivo.name.split(".").pop() || "pdf";
        // crypto.randomUUID só existe em contexto seguro (HTTPS/localhost) — o site
        // pode rodar em HTTP puro (IP sem certificado), então precisa de fallback.
        const uuid = crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const path = `${uuid}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("curriculos-banco-talentos")
          .upload(path, arquivo, { contentType: arquivo.type || undefined });
        if (uploadError) throw new Error(`Falha ao enviar currículo: ${uploadError.message}`);

        // Bucket é privado (currículo não pode ficar público na internet) -- getPublicUrl()
        // geraria um link que sempre dá 403. Guarda só o path do arquivo; quem for exibir
        // isso no RH gera um link assinado (createSignedUrl) autenticado, sob demanda.
        portfolioUrl = path;
      }

      const registro = {
        nome: form.nome.trim(),
        telefone: form.telefone,
        email: form.email,
        estado: form.estado || null,
        cidade: form.cidade || null,
        linkedin: form.linkedin || null,
        instagram: form.instagram || null,
        area_interesse: form.area_interesse || null,
        cargo_interesse: vagaTitulo || null, // veio de vaga específica -> já mostra o cargo certo no card
        experiencia: form.trajetoria || null,
        portfolio_url: portfolioUrl,
        origem: vagaTitulo ? `Candidatura à vaga: ${vagaTitulo}` : "Site",
        vaga_id: vagaId || null,
        status: "Disponível",
      };

      const { error: insertError } = await supabase.from("banco_talentos").insert(registro);
      if (insertError) throw insertError;

      // Espelha na planilha "Banco de Talentos" — não bloqueia o cadastro se falhar.
      fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/banco-talentos-notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...registro, created_at: new Date().toISOString() }),
      }).catch(() => {});

      setDone(true);
    } catch (err) {
      // Erro do Supabase (PostgrestError) não é instanceof Error -- é um objeto plano com
      // .message. Sem esse fallback, a mensagem da trava de duplicata (banco) nunca
      // aparecia pro candidato, caía sempre em "Erro desconhecido".
      const msg = err instanceof Error ? err.message : (err as { message?: string })?.message;
      setError(msg || "Erro desconhecido ao enviar.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative">
        <GlowBackground />
        <div className="max-w-lg w-full bg-[#121212]/80 border border-white/10 rounded-3xl p-10 text-center space-y-4 backdrop-blur-sm">
          <img src={logo} alt="Grupo Silva" className="h-10 mx-auto" />
          <h1 className="text-xl font-semibold text-white">Cadastro enviado! 🐢</h1>
          <p className="text-sm text-neutral-400">
            Obrigado pelo interesse em fazer parte do Grupo Silva! Seu perfil entrou no nosso
            Banco de Talentos — assim que surgir uma oportunidade compatível, nosso time de RH
            entra em contato.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <GlowBackground />
      <form
        onSubmit={handleSubmit}
        className="max-w-xl w-full bg-[#121212]/80 border border-white/10 rounded-3xl p-8 sm:p-10 space-y-6 backdrop-blur-sm"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <img src={logo} alt="Grupo Silva" className="h-10" />
            <a href="/" className="text-xs text-neutral-500 hover:text-neutral-300">← Voltar</a>
          </div>
          <div className="space-y-2">
            <Eyebrow>Banco de Talentos</Eyebrow>
            <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
              {vagaTitulo ? (
                <>Candidatura pra <span className="text-brand">{vagaTitulo}</span></>
              ) : (
                <>Cadastre seu perfil no <span className="text-brand">Grupo Silva</span></>
              )}
            </h1>
            <p className="text-sm text-neutral-400">
              {vagaTitulo
                ? "Preencha seus dados e concorra a essa vaga — se não rolar dessa vez, seu perfil já fica registrado pras próximas."
                : "Ainda não temos uma vaga aberta pra você? Deixe seu perfil registrado — quando surgir uma oportunidade compatível, entramos em contato."}
            </p>
          </div>

          <ul className="flex flex-wrap gap-x-5 gap-y-1.5">
            <Bullet>Leva uns 3 minutos</Bullet>
            <Bullet>100% gratuito</Bullet>
            <Bullet>Empresas reais contratando</Bullet>
          </ul>

          <TipBox lead="Capriche nas respostas.">
            Quanto mais completo o seu perfil — experiência, resultados e habilidades —, maiores as chances de sermos chamados pra uma vaga compatível.
          </TipBox>
        </div>

        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={set("website")}
          className="absolute left-[-9999px] w-px h-px opacity-0"
          aria-hidden="true"
        />

        <div className="space-y-4">
          <SectionLabel>Sobre você</SectionLabel>

          <Field label="Nome Completo *">
            <input required value={form.nome} onChange={set("nome")} className={inputClass} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Telefone para contato *">
              <input required value={form.telefone} onChange={(e) => setForm((f) => ({ ...f, telefone: maskTelefone(e.target.value) }))} className={inputClass} placeholder="(00) 00000-0000" />
            </Field>
            <Field label="E-mail para contato *">
              <input type="email" required value={form.email} onChange={set("email")} className={inputClass} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Estado *">
              <CustomSelect
                value={form.estado}
                onChange={(v) => setForm((f) => ({ ...f, estado: v }))}
                options={UFS}
              />
            </Field>
            <Field label="Cidade *">
              <input required value={form.cidade} onChange={set("cidade")} className={inputClass} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="LinkedIn">
              <input value={form.linkedin} onChange={set("linkedin")} className={inputClass} placeholder="linkedin.com/in/seu-perfil" />
            </Field>
            <Field label="Instagram">
              <input
                value={form.instagram}
                onChange={(e) => {
                  const raw = e.target.value.replace(/^@+/, "");
                  setForm((f) => ({ ...f, instagram: raw ? `@${raw}` : "" }));
                }}
                className={inputClass}
                placeholder="@seuusuario"
              />
            </Field>
          </div>
        </div>

        <div className="space-y-4">
          <SectionLabel>Sua candidatura</SectionLabel>

          <Field label="Área de interesse">
            <CustomSelect
              value={form.area_interesse}
              onChange={(v) => setForm((f) => ({ ...f, area_interesse: v }))}
              options={AREAS}
            />
          </Field>

          <Field label="Nos conte um resumo da sua trajetória profissional">
            <textarea rows={4} value={form.trajetoria} onChange={set("trajetoria")} className={inputClass} />
          </Field>

          <Field label={`Anexo do currículo (máx. ${MAX_FILE_MB}MB)`}>
            <input type="file" accept=".pdf,.doc,.docx" onChange={handleFile} className={`${inputClass} file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-brand file:text-black file:text-xs file:font-semibold`} />
          </Field>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-brand text-black font-semibold rounded-xl py-3.5 hover:brightness-110 transition disabled:opacity-60"
        >
          {submitting ? "Enviando..." : "Enviar cadastro"}
        </button>
      </form>
    </div>
  );
}
