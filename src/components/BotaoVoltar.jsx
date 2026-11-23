import { FiArrowLeft } from "react-icons/fi";

// Botão de voltar padrão do site: seta + texto, bem visível.
export default function BotaoVoltar({ onClick, texto = "Voltar", disabled = false, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-full border-2 border-[#004687] bg-white px-4 py-2 font-semibold text-[#004687] shadow-sm transition hover:bg-[#004687] hover:text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-[#004687]/30 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      <FiArrowLeft size={20} aria-hidden="true" />
      <span>{texto}</span>
    </button>
  );
}
