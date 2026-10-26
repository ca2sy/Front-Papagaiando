import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api, { mensagemDeErro } from "../../services/api";

export default function RedefinirSenha() {
  const [searchParams] = useSearchParams();
  const tokenDaUrl = searchParams.get("token") || "";

  const [form, setForm] = useState({
    token: tokenDaUrl,
    novaSenha: "",
    confirmarSenha: "",
  });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.novaSenha.length < 8) {
      setErro("A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    if (form.novaSenha !== form.confirmarSenha) {
      setErro("As senhas não conferem.");
      return;
    }

    setLoading(true);
    setErro("");

    try {
      const { data } = await api.post("/auth/redefinir-senha", {
        token: form.token.trim(),
        novaSenha: form.novaSenha,
      });

      alert(data.message || "Senha redefinida com sucesso!");
      navigate("/");
    } catch (error) {
      console.error("Erro ao redefinir senha:", error);
      setErro(mensagemDeErro(error, "Erro de conexão com o servidor"));
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#b3daff] p-4">
      <div className="bg-white backdrop-blur-md p-6 rounded-2xl shadow-xl w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-4 text-[#004687]">
          Redefinir senha
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!tokenDaUrl && (
            <div>
              <label className="block text-sm font-medium mb-1 text-[#004687]">
                Código de recuperação
              </label>
              <input
                type="text"
                name="token"
                value={form.token}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg text-[#004687] placeholder-[#004687] focus:outline-none focus:ring-2 focus:ring-[#004687] border border-[#004687] bg-white text-sm"
                placeholder="Cole aqui o código recebido"
                disabled={loading}
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1 text-[#004687]">
              Nova senha
            </label>
            <input
              type="password"
              name="novaSenha"
              value={form.novaSenha}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg text-[#004687] placeholder-[#004687] focus:outline-none focus:ring-2 focus:ring-[#004687] border border-[#004687] bg-white text-sm"
              placeholder="Mínimo 8 caracteres"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-[#004687]">
              Confirmar nova senha
            </label>
            <input
              type="password"
              name="confirmarSenha"
              value={form.confirmarSenha}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg text-[#004687] placeholder-[#004687] focus:outline-none focus:ring-2 focus:ring-[#004687] border border-[#004687] bg-white text-sm"
              placeholder="Repita a nova senha"
              disabled={loading}
              required
            />
            <p className="text-xs text-[#004687] mt-1">
              Mínimo de 8 caracteres
            </p>
          </div>

          {erro && (
            <div className="bg-red-500/20 border border-red-400 text-[#004687] px-4 py-3 rounded-lg text-sm">
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#004687] text-white font-semibold py-2 rounded-lg hover:bg-[#003366] transition-all duration-200 shadow-md hover:shadow-lg"
          >
            {loading ? "Salvando..." : "Redefinir senha"}
          </button>
        </form>

        <p className="mt-4 text-center text-[#004687] text-sm">
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
