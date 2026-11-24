import { useEffect, useState } from "react";
import { FiAlertTriangle, FiHelpCircle } from "react-icons/fi";
import { Spinner } from "./Carregando";
import { registrarOuvinteConfirmacao } from "./confirmar";

// Modal de confirmação no estilo do site.
// perigo = true deixa o botão principal vermelho (excluir, apagar...).
export default function ConfirmModal({
  aberto,
  titulo,
  mensagem,
  textoConfirmar = "Confirmar",
  textoCancelar = "Cancelar",
  perigo = false,
  carregando = false,
  erro = "",
  onConfirmar,
  onCancelar,
}) {
  useEffect(() => {
    if (!aberto) return;
    const aoTeclar = (e) => {
      if (e.key === "Escape" && !carregando) onCancelar();
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [aberto, carregando, onCancelar]);

  if (!aberto) return null;

  const Icone = perigo ? FiAlertTriangle : FiHelpCircle;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      onClick={() => !carregando && onCancelar()}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-titulo"
        aria-describedby="confirm-mensagem"
        onClick={(e) => e.stopPropagation()}
        className="aviso-entrada w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl text-center"
      >
        <div
          className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${
            perigo ? "bg-red-100 text-red-600" : "bg-[#b3daff] text-[#004687]"
          }`}
        >
          <Icone size={28} />
        </div>

        <h2
          id="confirm-titulo"
          className="mb-2 text-xl font-bold text-[#004687]"
        >
          {titulo}
        </h2>

        <div id="confirm-mensagem" className="mb-5 text-gray-700">
          {mensagem}
        </div>

        {erro && (
          <p
            role="alert"
            className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {erro}
          </p>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            disabled={carregando}
            onClick={onCancelar}
            className="flex-1 rounded-lg border-2 border-[#004687] px-4 py-3 font-semibold text-[#004687] hover:bg-blue-50 disabled:opacity-50"
          >
            {textoCancelar}
          </button>

          <button
            type="button"
            autoFocus
            disabled={carregando}
            onClick={onConfirmar}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 font-semibold text-white disabled:opacity-70 ${
              perigo
                ? "bg-red-600 hover:bg-red-700"
                : "bg-[#004687] hover:bg-[#003366]"
            }`}
          >
            {carregando && <Spinner tamanho={18} />}
            <span>{textoConfirmar}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Substitui o window.confirm(): montado uma vez no main.jsx.
export function ConfirmacaoContainer() {
  const [pedido, setPedido] = useState(null);

  useEffect(() => registrarOuvinteConfirmacao(setPedido), []);

  const responder = (resposta) => {
    pedido?.resolver(resposta);
    setPedido(null);
  };

  return (
    <ConfirmModal
      aberto={!!pedido}
      {...pedido?.opcoes}
      onConfirmar={() => responder(true)}
      onCancelar={() => responder(false)}
    />
  );
}
