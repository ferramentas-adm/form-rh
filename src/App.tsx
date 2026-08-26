import { useState } from "react";
import logo from "./assets/logo-grupo-silva.png";
import { maskCpf, maskCnpj, maskTelefone } from "./masks";
import { Eyebrow, Bullet, TipBox, SectionLabel, Field, inputClass, GlowBackground } from "./ui";

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
  contato_emergencia: string;
  convenio_medico: string;
  alergias: string;
  medicacao_uso_continuo: string;
  problemas_saude: string;
  tipo_sanguineo: string;
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
  contato_emergencia: "",
  convenio_medico: "",
  alergias: "",
  medicacao_uso_continuo: "",
  problemas_saude: "",
  tipo_sanguineo: "",
  website: "",
};

export default function App() {
  const [form, setForm] = useState<FormState>({ ...emptyForm });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
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
          contato_emergencia: form.contato_emergencia.trim(),
          convenio_medico: form.convenio_medico.trim(),
          alergias: form.alergias.trim(),
          medicacao_uso_continuo: form.medicacao_uso_continuo.trim(),
          problemas_saude: form.problemas_saude.trim(),
          tipo_sanguineo: form.tipo_sanguineo,
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
      <div className="min-h-screen flex items-center justify-center p-6 relative">
        <GlowBackground />
        <div className="max-w-lg w-full bg-[#121212]/80 border border-white/10 rounded-3xl p-10 text-center space-y-4 backdrop-blur-sm">
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
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <GlowBackground />
      <form
        onSubmit={handleSubmit}
        className="max-w-xl w-full bg-[#121212]/80 border border-white/10 rounded-3xl p-8 sm:p-10 space-y-6 backdrop-blur-sm"
      >
        <div className="space-y-4">
          <img src={logo} alt="Grupo Silva" className="h-10" />
          <div className="space-y-2">
            <Eyebrow>Integração</Eyebrow>
            <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
              Você está a um passo de <span className="text-brand">fazer parte do Grupo Silva</span>
            </h1>
            <p className="text-sm text-neutral-400">
              Preencha os dados abaixo pra darmos andamento ao seu Contrato de Prestação de Serviço.
            </p>
          </div>

          <ul className="flex flex-wrap gap-x-5 gap-y-1.5">
            <Bullet>Leva uns 5 minutos</Bullet>
            <Bullet>Contrato chega no seu e-mail</Bullet>
            <Bullet>Dados protegidos (LGPD)</Bullet>
          </ul>

          <TipBox lead="Tenha em mãos:">
            CPF e CNPJ da empresa, chave PIX vinculada ao CNPJ e seus dados de contato — assim você preenche tudo de uma vez.
          </TipBox>
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

        <div className="space-y-4">
          <SectionLabel>Sobre a empresa</SectionLabel>

          <Field label="Nome Completo do representante legal da empresa *">
            <input required value={form.nome} onChange={set("nome")} className={inputClass} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="CPF do representante legal *">
              <input required value={form.cpf} onChange={(e) => setForm((f) => ({ ...f, cpf: maskCpf(e.target.value) }))} className={inputClass} placeholder="000.000.000-00" />
            </Field>
            <Field label="CNPJ da empresa *">
              <input required value={form.cnpj} onChange={(e) => setForm((f) => ({ ...f, cnpj: maskCnpj(e.target.value) }))} className={inputClass} placeholder="00.000.000/0000-00" />
            </Field>
          </div>

          <Field
            label="Chave PIX *"
            hint="Atenção: pagamentos são feitos exclusivamente na conta PJ vinculada ao CNPJ informado. Não são aceitas chaves de celular, e-mail ou qualquer outra que não seja a do CNPJ da sua empresa."
          >
            <input required value={form.pix} onChange={set("pix")} className={inputClass} />
          </Field>
        </div>

        <div className="space-y-4">
          <SectionLabel>Sobre você</SectionLabel>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Data de Nascimento *">
              <input type="date" required value={form.data_nascimento} onChange={set("data_nascimento")} className={inputClass} />
            </Field>
            <Field label="Telefone *">
              <input required value={form.telefone} onChange={(e) => setForm((f) => ({ ...f, telefone: maskTelefone(e.target.value) }))} className={inputClass} placeholder="(00) 00000-0000" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="E-mail *">
              <input type="email" required value={form.email_pessoal} onChange={set("email_pessoal")} className={inputClass} />
            </Field>
            <Field label="Instagram | LinkedIn *">
              <input required value={form.rede_social} onChange={set("rede_social")} className={inputClass} />
            </Field>
          </div>

          <Field label="Disponibilidade para data de início *">
            <input type="date" required value={form.data_inicio_prevista} onChange={set("data_inicio_prevista")} className={inputClass} />
          </Field>
        </div>

        <div className="space-y-4">
          <SectionLabel>Informações adicionais</SectionLabel>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Contato de emergência">
              <input value={form.contato_emergencia} onChange={set("contato_emergencia")} className={inputClass} placeholder="Nome e telefone" />
            </Field>
            <Field label="Tipo sanguíneo">
              <select value={form.tipo_sanguineo} onChange={set("tipo_sanguineo")} className={inputClass}>
                <option value="">Selecione (se souber)</option>
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Possui convênio médico? Qual?">
            <input value={form.convenio_medico} onChange={set("convenio_medico")} className={inputClass} placeholder="Deixe em branco se não possui" />
          </Field>

          <Field label="Possui algum tipo de alergia?">
            <input value={form.alergias} onChange={set("alergias")} className={inputClass} placeholder="Deixe em branco se não possui" />
          </Field>

          <Field label="Toma algum tipo de medicação?">
            <input value={form.medicacao_uso_continuo} onChange={set("medicacao_uso_continuo")} className={inputClass} placeholder="Deixe em branco se não toma" />
          </Field>

          <Field label="Problemas de saúde">
            <input value={form.problemas_saude} onChange={set("problemas_saude")} className={inputClass} placeholder="Deixe em branco se não possui" />
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

        <p className="text-[11px] text-neutral-500 border-t border-white/10 pt-4">
          Ao preencher este formulário, você declara estar ciente de que seus dados serão tratados
          pelo Grupo Silva, em conformidade com a Lei Geral de Proteção de Dados (Lei nº
          13.709/2018), exclusivamente para fins de recrutamento, contratação, formalização
          contratual e cumprimento de obrigações legais relacionadas ao processo de admissão.
        </p>
      </form>
    </div>
  );
}
