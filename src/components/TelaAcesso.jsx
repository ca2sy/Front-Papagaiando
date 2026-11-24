import { Outlet, useLocation } from "react-router-dom";
import papagaiandoImg from "../assets/papagaiando.jpg";

// Moldura das telas de login e cadastro.
// Fica montada nas duas rotas: ao trocar de uma para a outra, o painel azul
// (logo) e o painel claro (formulário) deslizam e trocam de lado.
export default function TelaAcesso() {
  const { pathname } = useLocation();
  const modo = pathname.startsWith("/cadastro") ? "cadastro" : "login";

  return (
    <div className="acesso" data-modo={modo}>
      <div className="acesso-logo">
        <div className="acesso-logo-cartao">
          <img src={papagaiandoImg} alt="Papagaiando" />
        </div>
      </div>

      <main className="acesso-form">
        <div className="acesso-conteudo">
          <div key={modo} className="acesso-entrada w-full max-w-md">
            <p className="fonte-marca mb-6 text-center text-4xl sm:text-5xl font-bold text-[#2a5bbd] lg:text-left">
              Papagaiando
            </p>
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}

// Estilos compartilhados pelos formulários de login e cadastro
export const classeRotulo = "block text-sm font-semibold mb-1 text-[#1f3f80]";
export const classeCampo =
  "w-full px-4 py-3 rounded-xl border-2 border-[#2a5bbd]/25 bg-white text-[#1f3f80] placeholder-[#1f3f80]/40 focus:outline-none focus:border-[#2a5bbd] focus:ring-4 focus:ring-[#2a5bbd]/15 transition";
export const classeBotaoPrincipal =
  "w-full flex items-center justify-center gap-2 rounded-xl bg-[#2a5bbd] py-3 font-semibold text-white shadow-lg shadow-[#2a5bbd]/25 transition hover:bg-[#1f4a9e] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#2a5bbd]/30 disabled:opacity-70 disabled:cursor-wait";
export const classeLink =
  "font-semibold text-[#2a5bbd] underline-offset-4 hover:underline";
