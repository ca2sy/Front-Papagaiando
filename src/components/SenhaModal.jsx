import { useEffect, useState } from "react";
import { FiLock } from "react-icons/fi";
import { API_BASE_URL, getApiError } from "../services/api";
import { Spinner } from "./Carregando";


export default function SenhaModal({ isOpen, onClose, onConfirm, titulo, mensagem }) {
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const handleConfirmar = async () => {
    if (!senha.trim()) {
      setErro("Por favor, digite sua senha.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setErro("Sessão expirada. Faça login novamente.");
      return;
    }

    setLoading(true);
    setErro("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/verificar-senha`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ senha }),
        }
      );

      if (!response.ok) {
        const mensagem = await getApiError(
          response,
          "Não foi possível verificar a senha."
        );

        setErro(mensagem);
        return;
      }

      const data = await response.json();

      if (data.valido !== true) {
        setErro("Senha incorreta. Tente novamente.");
        return;
      }

      setSenha("");
      setErro("");
      onConfirm();

    } catch (error) {
      console.error("Erro ao verificar senha:", error);
      setErro("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setSenha("");
    setErro("");
    onClose();
  };

  useEffect(() => {
    if (!isOpen) return;
    const aoTeclar = (e) => e.key === "Escape" && handleClose();
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  });

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4"
      onClick={handleClose}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="senha-titulo"
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          handleConfirmar();
        }}
        className="aviso-entrada bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl text-center"
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#b3daff] text-[#004687]">
          <FiLock size={26} />
        </div>

        <h3 id="senha-titulo" className="text-xl font-bold text-[#004687] mb-2">
          {titulo}
        </h3>
        <p className="text-gray-600 mb-5">{mensagem}</p>

        <input
          type="password"
          value={senha}
          autoFocus
          onChange={(e) => {
            setSenha(e.target.value);
            setErro("");
          }}
          className={`w-full px-4 py-3 rounded-lg text-[#004687] placeholder-[#004687]/50 border-2 focus:outline-none focus:ring-2 focus:ring-[#004687] ${
            erro ? "border-red-400" : "border-[#004687]"
          }`}
          placeholder="Digite sua senha"
          aria-label="Senha"
          aria-invalid={!!erro}
          disabled={loading}
        />

        <p role="alert" className="min-h-6 mt-2 mb-3 text-sm text-red-600">
          {erro}
        </p>

        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 rounded-lg border-2 border-[#004687] px-4 py-3 font-semibold text-[#004687] hover:bg-blue-50 disabled:opacity-50"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#004687] px-4 py-3 font-semibold text-white hover:bg-[#003366] disabled:opacity-70"
            disabled={loading}
          >
            {loading && <Spinner tamanho={18} />}
            {loading ? "Verificando..." : "Continuar"}
          </button>
        </div>
      </form>
    </div>
  );
}
