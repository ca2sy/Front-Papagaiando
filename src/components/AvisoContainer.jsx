import { useEffect, useState } from "react";
import { FiCheckCircle, FiAlertCircle, FiInfo } from "react-icons/fi";
import { registrarOuvinteAviso } from "./Aviso";

const DURACAO_MS = 2500;

const estilos = {
  sucesso: { icone: FiCheckCircle, cor: "text-green-600", barra: "bg-green-500" },
  erro: { icone: FiAlertCircle, cor: "text-red-600", barra: "bg-red-500" },
  info: { icone: FiInfo, cor: "text-[#004687]", barra: "bg-[#004687]" },
};

export default function AvisoContainer() {
  const [atual, setAtual] = useState(null);

  useEffect(() => registrarOuvinteAviso(setAtual), []);

  useEffect(() => {
    if (!atual) return;
    const timer = setTimeout(() => setAtual(null), DURACAO_MS);
    return () => clearTimeout(timer);
  }, [atual]);

  if (!atual) return null;

  const { icone: Icone, cor, barra } = estilos[atual.tipo] ?? estilos.info;

  return (
    <div className="fixed inset-x-0 top-0 z-[100] flex justify-center p-4 pointer-events-none">
      <div
        key={atual.id}
        role="status"
        aria-live="polite"
        onClick={() => setAtual(null)}
        className="aviso-topo pointer-events-auto cursor-pointer bg-white rounded-2xl shadow-2xl border border-[#b3daff] w-full max-w-sm overflow-hidden"
      >
        <div className="flex items-center gap-3 px-5 py-4">
          <Icone className={`${cor} shrink-0`} size={28} />
          <p className="text-[#004687] font-semibold">{atual.mensagem}</p>
        </div>
        <div
          className={`aviso-barra h-1 ${barra}`}
          style={{ animationDuration: `${DURACAO_MS}ms` }}
        />
      </div>
    </div>
  );
}
