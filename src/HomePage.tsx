import logo from "./assets/logo-grupo-silva.png";
import { Eyebrow } from "./ui";

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-[#121212]/80 border border-white/10 rounded-3xl p-8 sm:p-10 space-y-7 text-center">
        <img src={logo} alt="Grupo Silva" className="h-10 mx-auto" />
        <div className="space-y-2">
          <Eyebrow>Grupo Silva</Eyebrow>
          <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
            Carreiras no <span className="text-brand">Grupo Silva</span>
          </h1>
          <p className="text-sm text-neutral-400">Escolha uma opção abaixo pra continuar.</p>
        </div>

        <div className="space-y-3">
          <a
            href="/vagas.html"
            className="block w-full bg-brand text-black font-semibold rounded-xl py-3.5 hover:brightness-110 transition"
          >
            Ver Vagas Abertas
          </a>
          <a
            href="/talentos.html"
            className="block w-full border border-white/20 text-white font-medium rounded-xl py-3.5 hover:bg-white/5 transition"
          >
            Entrar no Banco de Talentos
          </a>
        </div>

        <p className="text-[11px] text-neutral-600 pt-4 border-t border-white/10">
          Já foi selecionado(a) pra uma vaga? Use o link do Formulário de Integração enviado
          pelo nosso time de RH.
        </p>
      </div>
    </div>
  );
}
