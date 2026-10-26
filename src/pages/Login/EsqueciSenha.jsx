import { useState } from "react";
import { Link } from "react-router-dom";
import api, { mensagemDeErro } from "../../services/api";

export default function EsqueciSenha() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [tokenRecuperacao, setTokenRecuperacao] = useState("");
  const [erro, setErro] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setErro("");
    setMensagem("");
    setTokenRecuperacao("");

    try {
      const { data } = await api.post("/auth/esqueci-senha", { email });
      setMensagem(data.message);

      if (data.token) {
        setTokenRecuperacao(data.token);
      }
    } catch (error) {
      console.error("Erro ao solicitar recuperação:", error);
      setErro(mensagemDeErro(error, "Erro de conexão com o servidor"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#b3daff] p-4">
      <div className="bg-white backdrop-blur-md p-6 rounded-2xl shadow-xl w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-4 text-[#004687]">
          Esqueci a senha
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-[#004687]">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-[#004687] placeholder-[#004687] focus:outline-none focus:ring-2 focus:ring-[#004687] border border-[#004687] bg-white text-sm"
              placeholder="exemplo@email.com"
              disabled={loading}
              required
            />
            <p className="text-xs text-[#004687] mt-1">
              Informe o email da sua conta
            </p>
          </div>

          {erro && (
            <div className="bg-red-500/20 border border-red-400 text-[#004687] px-4 py-3 rounded-lg text-sm">
              {erro}
            </div>
          )}

          {mensagem && (
            <div className="bg-green-500/20 border border-green-400 text-[#004687] px-4 py-3 rounded-lg text-sm">
              {mensagem}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#004687] text-white font-semibold py-2 rounded-lg hover:bg-[#003366] transition-all duration-200 shadow-md hover:shadow-lg"
          >
            {loading ? "Enviando..." : "Enviar"}
          </button>
        </form>

        {tokenRecuperacao && (
          <p className="mt-4 text-center text-[#004687] text-sm">
            <Link
              to={`/redefinir-senha?token=${tokenRecuperacao}`}
              className="font-semibold underline hover:text-[#67B5DF] transition-colors"
            >
              Redefinir senha agora
            </Link>
          </p>
        )}

        <p className="mt-4 text-center text-[#004687] text-sm">
          Já tem o código?{" "}
          <Link
            to="/redefinir-senha"
            className="font-semibold underline hover:text-[#67B5DF] transition-colors"
          >
            Redefinir senha
          </Link>
        </p>

        <p className="mt-2 text-center text-[#004687] text-sm">
          Lembrou a senha?{" "}
          <Link
            to="/"
            className="font-semibold underline hover:text-[#67B5DF] transition-colors"
          >
            Faça login
          </Link>
        </p>
      </div>
    </div>
  );
}
