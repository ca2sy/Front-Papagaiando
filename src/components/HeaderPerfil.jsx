import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiMenu,
  FiX,
  FiEdit2,
  FiPlusSquare,
  FiFolderPlus,
  FiUsers,
  FiLogOut,
  FiSliders,
} from "react-icons/fi";
import papagaiandoImg from "../assets/papagaiando.jpg";
import { sairDaConta } from "../services/auth";
import SenhaModal from "./SenhaModal";

const itensMenu = [
  { acao: "criar-botao", texto: "Criar botão", icone: FiPlusSquare },
  { acao: "criar-categoria", texto: "Criar categoria", icone: FiFolderPlus },
  { acao: "editar-perfil", texto: "Editar perfil", icone: FiEdit2 },
  { acao: "sair", texto: "Trocar de perfil", icone: FiUsers },
];

// itemEdicao: texto do item "modo edição" desta tela (ex.: "Editar categorias").
export default function HeaderPerfil({ perfil, onMenuClick, itemEdicao }) {
  const [menuAberto, setMenuAberto] = useState(false);
  const [pedindoSenha, setPedindoSenha] = useState(false);
  const navigate = useNavigate();

  const itens = itemEdicao
    ? [
        { acao: "modo-edicao", texto: itemEdicao, icone: FiSliders },
        ...itensMenu,
      ]
    : itensMenu;

  useEffect(() => {
    if (!menuAberto) return;
    const aoTeclar = (e) => e.key === "Escape" && setMenuAberto(false);
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [menuAberto]);

  const handleMenuClick = (acao) => {
    setMenuAberto(false);

    if (acao === "sair-conta") {
      sairDaConta();

      navigate("/", { replace: true });
      return;
    }

    if (acao === "sair") {
      // Trocar de perfil exige a senha da conta
      setPedindoSenha(true);
      return;
    }

    if (onMenuClick) {
      onMenuClick(acao);
    }
  };

  return (
    <header className="bg-[#004280] shadow-md sticky top-0 z-40">
      <div className="flex justify-between items-center px-3 sm:px-5 py-3">
        <div className="flex items-center min-w-0">
          <img
            src={papagaiandoImg}
            alt="Papagaiando"
            className="h-10 w-10 rounded-full object-cover"
          />
          <span className="ml-2 text-xl sm:text-2xl font-bold text-white truncate">
            Papagaiando
          </span>
        </div>

        <button
          onClick={() => setMenuAberto(true)}
          aria-label="Abrir menu"
          aria-expanded={menuAberto}
          className="flex items-center gap-2 rounded-full bg-white py-1.5 pl-1.5 pr-3 text-[#004687] shadow hover:bg-[#b3daff] transition"
        >
          {perfil?.urlFoto && (
            <img
              src={perfil.urlFoto}
              alt=""
              className="w-8 h-8 rounded-full object-cover"
            />
          )}
          <FiMenu size={22} aria-hidden="true" />
          <span className="hidden sm:inline font-semibold">Menu</span>
        </button>
      </div>

      {/* Menu lateral (abre pela direita) */}
      <div
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity ${
          menuAberto ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMenuAberto(false)}
        aria-hidden="true"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={`fixed right-0 top-0 z-50 flex h-full w-72 max-w-[85vw] flex-col bg-white shadow-2xl transition-transform duration-200 ${
          menuAberto ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between bg-[#004280] px-4 py-4 text-white">
          <div className="flex items-center gap-3 min-w-0">
            {perfil?.urlFoto && (
              <img
                src={perfil.urlFoto}
                alt=""
                className="h-11 w-11 rounded-full border-2 border-white object-cover"
              />
            )}
            <div className="min-w-0">
              <p className="text-xs text-white/70">Perfil atual</p>
              <p className="truncate text-lg font-bold">{perfil?.nome}</p>
            </div>
          </div>
          <button
            onClick={() => setMenuAberto(false)}
            aria-label="Fechar menu"
            className="rounded-full p-2 hover:bg-white/15"
          >
            <FiX size={24} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          {itens.map((item) => (
            <button
              key={item.acao}
              onClick={() => handleMenuClick(item.acao)}
              tabIndex={menuAberto ? 0 : -1}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-semibold text-[#004687] hover:bg-[#b3daff]/50 transition"
            >
              <item.icone size={22} aria-hidden="true" />
              {item.texto}
            </button>
          ))}
        </nav>

        <div className="border-t p-3">
          <button
            onClick={() => handleMenuClick("sair-conta")}
            tabIndex={menuAberto ? 0 : -1}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-semibold text-red-600 hover:bg-red-50 transition"
          >
            <FiLogOut size={22} aria-hidden="true" />
            Sair da conta
          </button>
        </div>
      </aside>

      <SenhaModal
        isOpen={pedindoSenha}
        titulo="Trocar de perfil"
        mensagem="Digite a senha da conta para trocar de perfil."
        onClose={() => setPedindoSenha(false)}
        onConfirm={() => {
          setPedindoSenha(false);
          navigate("/meus-perfis");
        }}
      />
    </header>
  );
}
