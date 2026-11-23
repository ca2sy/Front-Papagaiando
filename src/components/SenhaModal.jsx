import { useState } from "react";
import { API_BASE_URL, getApiError } from "../services/api";


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
        setErro("Senha incorreta.");
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
    setSenha("");
    setErro("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <h3 className="text-lg font-bold text-blue-900 mb-2">{titulo}</h3>
        <p className="text-gray-600 mb-4">{mensagem}</p>
        
        <input 
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleConfirmar()}
          className="w-full p-3 border border-gray-300 rounded-lg mb-2"
          placeholder="Digite sua senha"
          disabled={loading}
        />
        
        {erro && (
          <p className="text-red-600 text-sm mb-4">{erro}</p>
        )}
        
        <div className="flex justify-end space-x-3">
          <button 
            onClick={handleClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
            disabled={loading}
          >
            Cancelar
          </button>
          <button 
            onClick={handleConfirmar}
            className="px-4 py-2 bg-[#004687] text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
            disabled={loading}
          >
            {loading ? "Verificando..." : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}