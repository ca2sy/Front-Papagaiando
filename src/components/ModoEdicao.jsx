import { FiCheck, FiEdit2, FiRotateCcw, FiTrash2 } from "react-icons/fi";

// Faixa que aparece no topo quando a tela está em modo edição.
export function BarraEdicao({ texto, onConcluir }) {
  return (
    <div className="aviso-topo sticky top-[64px] z-30 mb-6 flex flex-col gap-3 rounded-2xl bg-[#004687] p-4 text-white shadow-lg sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15">
          <FiEdit2 size={20} aria-hidden="true" />
        </span>
        <div>
          <p className="font-bold">Modo edição</p>
          <p className="text-sm text-white/85">{texto}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onConcluir}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-2 font-semibold text-[#004687] hover:bg-[#e6f3ff] focus:outline-none focus-visible:ring-4 focus-visible:ring-white/50"
      >
        <FiCheck size={20} aria-hidden="true" />
        <span>Concluído</span>
      </button>
    </div>
  );
}

// Selo de lápis por cima do card, indicando que tocar abre a edição.
export function SeloEditar() {
  return (
    <span className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl bg-[#004687]/35">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#004687] shadow-lg">
        <FiEdit2 size={22} aria-hidden="true" />
      </span>
    </span>
  );
}

const classeAcao =
  "aviso-entrada absolute -top-2 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white text-white shadow-lg focus:outline-none focus-visible:ring-4";

// Botões redondos nos cantos do card (excluir / restaurar).
export function AcaoExcluir({ nome, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Excluir ${nome}`}
      title="Excluir"
      className={`${classeAcao} -right-2 bg-red-600 hover:bg-red-700 focus-visible:ring-red-300`}
    >
      <FiTrash2 size={18} aria-hidden="true" />
    </button>
  );
}

export function AcaoRestaurar({ nome, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Restaurar ${nome} ao original`}
      title="Restaurar ao original"
      className={`${classeAcao} -left-2 bg-[#2f7fd1] hover:bg-[#004687] focus-visible:ring-[#b3daff]`}
    >
      <FiRotateCcw size={18} aria-hidden="true" />
    </button>
  );
}
