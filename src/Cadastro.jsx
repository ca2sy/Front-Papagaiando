import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Cadastro() {
  const [form, setForm] = useState({
    nome: "",
    sobrenome: "",
    email: "",
    senha: "",
  });

  const navigate = useNavigate(); // <-- inicializa o navigate

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
      const response = await fetch("http://localhost:8080/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.token); // <-- salva o token
        alert("Cadastro realizado com sucesso!");
        navigate("/login"); // <-- redireciona para Meus Perfis
      } else {
        const errorData = await response.json();
        alert("Erro ao cadastrar: " + (errorData.message || "Tente novamente."));
      }
    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      alert("Não foi possível realizar o cadastro. Tente novamente.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 to-blue-300">
      <div className="bg-blue-550/90 backdrop-blur-md p-10 rounded-3xl shadow-2xl w-full max-w-md text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600/30 rounded-3xl -z-10" />

        <h1 className="text-4xl font-extrabold text-center mb-8 text-blue-900">
          Cadastro 
        </h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-base font-medium mb-1 text-blue-900">Nome</label>
            <input
              type="text"
              name="nome"
              value={form.nome}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-blue-100 text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="Digite seu nome"
              required
            />
          </div>

          <div>
            <label className="block text-base font-medium mb-1 text-blue-900">Sobrenome do responsável</label>
            <input
              type="text"
              name="sobrenome"
              value={form.sobrenome}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-blue-100 text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="Digite o sobrenome"
              required
            />
          </div>

          <div>
            <label className="block text-base font-medium mb-1 text-blue-900">Email do responsável</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-blue-100 text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="exemplo@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-base font-medium mb-1 text-blue-900">Senha</label>
            <input
              type="password"
              name="senha"
              value={form.senha}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-blue-100 text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="Crie uma senha"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-800 text-white font-semibold py-3 rounded-lg hover:bg-blue-900 transition shadow-lg"
          >
            Cadastrar
          </button>
        </form>
      </div>
    </div>
  );
}
