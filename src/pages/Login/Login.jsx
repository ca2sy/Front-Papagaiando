import { useState } from "react";
import papagaiandoImg from "../../assets/papagaiando.jpg";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function Login() {
  const [form, setForm] = useState({ email: "", senha: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId);
      alert(`Bem-vindo, ${data.nome}!`);

      navigate("/meus-perfis");
    } catch (err) {
      console.error("Erro na requisição:", err);

      if (err.response) {
        alert("Erro: " + (err.response.data?.message || "Tente novamente."));
      } else {
        alert("Erro de conexão com o servidor");
      }
    } finally {
      setLoading(false);
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
                disabled={loading}
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
                disabled={loading}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#004687] text-white font-semibold py-3 rounded-lg hover:bg-[#003366] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          {loading && (
            <p className="mt-4 text-center text-[#004687] text-sm">
              Conectando ao servidor, a primeira entrada pode levar até um minuto.
            </p>
          )}

          <p className="mt-4 text-center text-[#004687]">
            <Link
              to="/esqueci-senha"
              className="font-semibold underline hover:text-[#67B5DF] transition-colors duration-300"
            >
              Esqueceu a senha?
            </Link>
          </p>

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