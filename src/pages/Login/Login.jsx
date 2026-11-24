import { useState } from "react";
import { API_BASE_URL, getApiError } from "../../services/api";
import papagaiandoImg from "../../assets/papagaiando.jpg";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { aviso } from "../../components/Aviso";
import { limparCache } from "../../services/cache";
import { Spinner } from "../../components/Carregando";

export default function Login() {
  const [form, setForm] = useState({ email: "", senha: "" });
  const [enviando, setEnviando] = useState(false);
  const navigate = useNavigate();

  // Já está logado: vai direto para os perfis
  if (localStorage.getItem("token")) {
    return <Navigate to="/meus-perfis" replace />;
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (enviando) return;
    setEnviando(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const mensagem = await getApiError(response, "Erro ao fazer login.");
        aviso(mensagem, "erro");
        return;
      }

      const data = await response.json();
      limparCache();
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId);
      aviso(`Bem-vindo, ${data.nome}!`, "sucesso");

      navigate("/meus-perfis", { replace: true });
    } catch (err) {
      console.error("Erro na requisição:", err);
      aviso("Erro de conexão com o servidor", "erro");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Lado esquerdo com a imagem (apenas desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#b3daff] items-center justify-center p-4">
        <img
          src={papagaiandoImg}
          alt="Papagaiando"
          className="w-1/2 h-auto rounded-4xl object-contain"
        />
      </div>

      {/* Lado direito com o formulário de login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-[#b3daff] p-4 min-h-screen">
        <div className="bg-white backdrop-blur-md p-6 lg:p-10 rounded-3xl shadow-2xl w-full max-w-sm md:max-w-md">
          <h1 className="text-3xl font-extrabold mb-6 text-center text-[#004687]">
            Login
          </h1>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-base font-medium mb-1 text-[#004687]">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg text-[#004687] placeholder-[#004687] focus:outline-none focus:ring-2 focus:ring-[#004687] border border-[#004687] bg-white"
                placeholder="exemplo@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-base font-medium mb-1 text-[#004687]">Senha</label>
              <input
                type="password"
                name="senha"
                value={form.senha}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg text-[#004687] placeholder-[#004687] focus:outline-none focus:ring-2 focus:ring-[#004687] border border-[#004687] bg-white"
                placeholder="Senha"
                required
              />
            </div>

            <button
              type="submit"
              disabled={enviando}
              className="w-full flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait bg-[#004687] text-white font-semibold py-3 rounded-lg hover:bg-[#003366] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {enviando && <Spinner tamanho={20} />}
              <span>{enviando ? "Entrando..." : "Entrar"}</span>
            </button>
          </form>

          <p className="mt-4 text-center text-[#004687]">
            Ainda não tem uma conta?{" "}
            <Link 
              to="/cadastro" 
              className="font-semibold underline hover:text-[#67B5DF] transition-colors duration-300"
            >
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}