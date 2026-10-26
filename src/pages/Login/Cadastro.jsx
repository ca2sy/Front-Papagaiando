import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";

export default function Cadastro() {
  const [form, setForm] = useState({
    nome: "",
    sobrenome: "",
    email: "",
    senha: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.senha.length < 8) {
      alert("A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    const payload = {
      nome: form.nome + " " + form.sobrenome,
      email: form.email,
      senha: form.senha
    };

    try {
      const { data } = await api.post("/usuarios", payload);
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.usuario.id);
      alert("Cadastro realizado com sucesso!");
      navigate("/meus-perfis");
    } catch (error) {
      console.error("Erro ao cadastrar:", error);

      if (error.response) {
        alert("Erro ao cadastrar: " + (error.response.data?.message || "Tente novamente."));
      } else {
        alert("Não foi possível realizar o cadastro. Tente novamente.");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#b3daff] p-4">
      <div className="bg-white backdrop-blur-md p-6 rounded-2xl shadow-xl w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-4 text-[#004687]">
          Cadastro
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-[#004687]">
              Nome
            </label>
            <input
              type="text"
              name="nome"
              value={form.nome}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg text-[#004687] placeholder-[#004687] focus:outline-none focus:ring-2 focus:ring-[#004687] border border-[#004687] bg-white text-sm"
              placeholder="Digite seu nome"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-[#004687]">
              Sobrenome
            </label>
            <input
              type="text"
              name="sobrenome"
              value={form.sobrenome}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg text-[#004687] placeholder-[#004687] focus:outline-none focus:ring-2 focus:ring-[#004687] border border-[#004687] bg-white text-sm"
              placeholder="Digite o sobrenome"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-[#004687]">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg text-[#004687] placeholder-[#004687] focus:outline-none focus:ring-2 focus:ring-[#004687] border border-[#004687] bg-white text-sm"
              placeholder="exemplo@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-[#004687]">
              Senha
            </label>
            <input
              type="password"
              name="senha"
              value={form.senha}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg text-[#004687] placeholder-[#004687] focus:outline-none focus:ring-2 focus:ring-[#004687] border border-[#004687] bg-white text-sm"
              placeholder="Mínimo 8 caracteres"
              required
            />
            <p className="text-xs text-[#004687] mt-1">
              Mínimo de 8 caracteres
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-[#004687] text-white font-semibold py-2 rounded-lg hover:bg-[#003366] transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Cadastrar
          </button>
        </form>

        <p className="mt-4 text-center text-[#004687] text-sm">
          Já tem uma conta?{" "}
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