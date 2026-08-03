import logo from "./assets/logo-grupo-silva.png";

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-[#121212]/80 border border-white/10 rounded-3xl p-8 sm:p-10 space-y-6 text-center">
        <img src={logo} alt="Grupo Silva" className="h-10 mx-auto" />
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-white">Carreiras no Grupo Silva</h1>
          <p className="text-sm text-neutral-400">Escolha uma opção abaixo pra continuar.</p>
        </div>

        <div className="space-y-3">
          <a
            href="/vagas.html"
            className="block w-full bg-brand text-black font-semibold rounded-xl py-3 hover:brightness-110 transition"
          >
            Ver Vagas Abertas
          </a>
          <a
            href="/talentos.html"
            className="block w-full border border-white/20 text-white font-medium rounded-xl py-3 hover:bg-white/5 transition"
          >
            Entrar no Banco de Talentos
          </a>
        </div>

        <p className="text-[11px] text-neutral-600 pt-2 border-t border-white/10">
          Já foi selecionado(a) pra uma vaga? Use o link do Formulário de Integração enviado
          pelo nosso time de RH.
        </p>
      </div>
    </div>
  );
}
