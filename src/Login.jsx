import { useState } from "react";
import papagaiandoImg from "./img/papagaiando.jpg";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ email: "", senha: "" });
  const navigate = useNavigate(); // <-- inicializa o navigate

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8080/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert("Erro: " + errorData.error);
        return;
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId);
      alert(`Bem-vindo, ${data.nome}!`);

      navigate("/meus-perfis"); // <-- redireciona para Meus Perfis
    } catch (err) {
      console.error("Erro na requisição:", err);
      alert("Erro de conexão com o servidor");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Lado esquerdo com a imagem (apenas desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-400 items-center justify-center p-4">
        <img
          src={papagaiandoImg}
          alt="Papagaiando"
          className="w-1/2 h-auto rounded-4xl object-contain"
        />
      </div>

      {/* Lado direito com o formulário de login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-blue-200 p-4 min-h-screen">
        <div className="bg-blue-400 backdrop-blur-md p-6 lg:p-10 rounded-3xl shadow-2xl w-full max-w-sm md:max-w-md text-white">
          <h1 className="text-3xl font-extrabold mb-6 text-center text-white">
            Login
          </h1>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-base font-medium mb-1 text-white">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                placeholder="exemplo@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-base font-medium mb-1 text-white">Senha</label>
              <input
                type="password"
                name="senha"
                value={form.senha}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                placeholder="Senha"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 text-white font-semibold py-3 rounded-lg hover:bg-blue-600 transition shadow-lg"
            >
              Entrar
            </button>
          </form>

          <p className="mt-4 text-center text-white">
            Ainda não tem uma conta?{" "}
            <Link to="/cadastro" className="font-semibold underline hover:text-blue-200">
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
