import { useState } from "react";
import logo from "./assets/logo-grupo-silva.png";
import { maskCpf, maskCnpj, maskTelefone } from "./masks";

// URL da function pública que recebe esse form e grava em dh_ativacoes (fila "Aguardando RH").
// Sem token embutido no front — endpoint é público de propósito, protegido por honeypot
// (campo "website" abaixo, invisível pra humano) + CORS restrito ao domínio de produção.
const INTAKE_URL =
  import.meta.env.VITE_INTAKE_URL ||
  "https://vxwjgumjkmtbvywdewhj.supabase.co/functions/v1/activation-form-public";

type FormState = {
  data_inicio_prevista: string;
  nome: string;
  cpf: string;
  cnpj: string;
  data_nascimento: string;
  pix: string;
  email_pessoal: string;
  telefone: string;
  rede_social: string;
  website: string; // honeypot — deve ficar sempre vazio
};

const emptyForm: FormState = {
  data_inicio_prevista: "",
  nome: "",
  cpf: "",
  cnpj: "",
  data_nascimento: "",
  pix: "",
  email_pessoal: "",
  telefone: "",
  rede_social: "",
  website: "",
};

export default function App() {
  const [form, setForm] = useState<FormState>({ ...emptyForm });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.website) return; // bot caiu no honeypot — finge sucesso silenciosamente
    if (!form.data_inicio_prevista || !form.nome.trim() || !form.cpf || !form.cnpj
      || !form.data_nascimento || !form.pix.trim() || !form.email_pessoal
      || !form.telefone || !form.rede_social.trim()) {
      setError("Preencha todos os campos, todos são obrigatórios.");
      return;
    }
    // CPF/CNPJ com dígito faltando (ex: usuário parou de digitar no meio) não são pegos
    // pelo "campo vazio" acima -- confere quantidade de dígitos antes de mandar pro backend.
    if (form.cpf.replace(/\D/g, "").length !== 11) {
      setError("CPF inválido — precisa ter 11 dígitos.");
      return;
    }
    if (form.cnpj.replace(/\D/g, "").length !== 14) {
      setError("CNPJ inválido — precisa ter 14 dígitos.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(INTAKE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.nome.trim(),
          cpf: form.cpf,
          cnpj: form.cnpj,
          telefone: form.telefone,
          email_pessoal: form.email_pessoal,
          data_nascimento: form.data_nascimento,
          pix: form.pix,
          rede_social: form.rede_social,
          data_inicio_prevista: form.data_inicio_prevista,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Falha ao enviar. Tente novamente.");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido ao enviar.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-[#121212]/80 border border-white/10 rounded-3xl p-10 text-center space-y-4">
          <img src={logo} alt="Grupo Silva" className="h-10 mx-auto" />
          <h1 className="text-xl font-semibold text-white">Cadastro enviado! 🐢</h1>
          <p className="text-sm text-neutral-400">
            Recebemos suas informações. Em breve você receberá em seu e-mail o seu Contrato de
            Trabalho e a confirmação final da sua data de início.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="max-w-lg w-full bg-[#121212]/80 border border-white/10 rounded-3xl p-8 sm:p-10 space-y-5"
      >
        <div className="space-y-3 mb-4">
          <img src={logo} alt="Grupo Silva" className="h-10" />
          <h1 className="text-lg font-semibold text-white">Formulário de Integração - Grupo Silva</h1>
          <p className="text-sm text-neutral-300">
            Parabéns! Você está a um passo de ingressar no Grupo Silva!
          </p>
          <p className="text-xs text-neutral-400">
            Este formulário é essencial para darmos andamento ao seu Contrato de Prestação de
            Serviço. Por favor, preencha todos os campos com atenção e complete as informações
            solicitadas abaixo.
          </p>
          <p className="text-xs text-neutral-400">
            Após o envio deste formulário, você receberá em seu e-mail: Seu Contrato de Trabalho
            e a confirmação final da sua data de início.
          </p>
          <p className="text-sm text-white">Bem-vindo(a) ao Grupo Silva! 🐢</p>
          <p className="text-[11px] text-neutral-500 border-t border-white/10 pt-3">
            Ao preencher este formulário, você declara estar ciente de que seus dados serão
            tratados pelo Grupo Silva, em conformidade com a Lei Geral de Proteção de Dados (Lei
            nº 13.709/2018), exclusivamente para fins de recrutamento, contratação, formalização
            contratual e cumprimento de obrigações legais relacionadas ao processo de admissão.
          </p>
        </div>

        {/* Honeypot — invisível pra humano, só bot preenche */}
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={set("website")}
          className="absolute left-[-9999px] w-px h-px opacity-0"
          aria-hidden="true"
        />

        <Field label="Disponibilidade para data de início: *">
          <input type="date" required value={form.data_inicio_prevista} onChange={set("data_inicio_prevista")} className={inputClass} />
        </Field>

        <Field label="Nome Completo do representante legal da empresa: *">
          <input required value={form.nome} onChange={set("nome")} className={inputClass} />
        </Field>

        <Field label="CPF do representante legal da empresa: *">
          <input required value={form.cpf} onChange={(e) => setForm((f) => ({ ...f, cpf: maskCpf(e.target.value) }))} className={inputClass} placeholder="000.000.000-00" />
        </Field>

        <Field label="CNPJ da empresa: *">
          <input required value={form.cnpj} onChange={(e) => setForm((f) => ({ ...f, cnpj: maskCnpj(e.target.value) }))} className={inputClass} placeholder="00.000.000/0000-00" />
        </Field>

        <Field label="Data de Nascimento *">
          <input type="date" required value={form.data_nascimento} onChange={set("data_nascimento")} className={inputClass} />
        </Field>

        <Field label="Chave PIX *">
          <input required value={form.pix} onChange={set("pix")} className={inputClass} />
          <p className="text-[11px] text-amber-400/80 mt-1">
            Atenção: os pagamentos serão realizados exclusivamente na conta PJ vinculada ao CNPJ
            da empresa informada. Não serão aceitas chaves PIX do tipo número de celular, e-mail
            ou qualquer outra opção diferente do CNPJ. Informe apenas a chave PIX cadastrada com
            o CNPJ da sua empresa.
          </p>
        </Field>

        <Field label="E-mail do representante legal da empresa: *">
          <input type="email" required value={form.email_pessoal} onChange={set("email_pessoal")} className={inputClass} />
        </Field>

        <Field label="Telefone *">
          <input required value={form.telefone} onChange={(e) => setForm((f) => ({ ...f, telefone: maskTelefone(e.target.value) }))} className={inputClass} placeholder="(00) 00000-0000" />
        </Field>

        <Field label="Rede Social | Instagram *">
          <input required value={form.rede_social} onChange={set("rede_social")} className={inputClass} placeholder="Instagram e LinkedIn" />
        </Field>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-brand text-black font-semibold rounded-xl py-3 hover:brightness-110 transition disabled:opacity-60"
        >
          {submitting ? "Enviando..." : "Enviar cadastro"}
        </button>
      </form>
    </div>
  );
}

const inputClass =
  "w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-brand";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs text-neutral-400">{label}</span>
      {children}
    </label>
  );
}
