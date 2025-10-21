import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CriarPerfil() {
  const [nome, setNome] = useState("");
  const [fotoSelecionada, setFotoSelecionada] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const imagensPapagaiando = [
    { nome: "verde", url: "https://bkueynyjbvxuavboqnja.supabase.co/storage/v1/object/public/perfil/papagaiando-verd.jpg" },
    { nome: "roxo", url: "https://bkueynyjbvxuavboqnja.supabase.co/storage/v1/object/public/perfil/papagaiando-roxo.jpg" },
    { nome: "rosa", url: "https://bkueynyjbvxuavboqnja.supabase.co/storage/v1/object/public/perfil/papagaiando-rosa.jpg" },
    { nome: "azul", url: "https://bkueynyjbvxuavboqnja.supabase.co/storage/v1/object/public/perfil/papagaiando-azul.jpg" }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nome || !fotoSelecionada) {
      alert("Preencha o nome e escolha uma imagem");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("token");
    const usuarioId = localStorage.getItem("userId");

    if (!token || !usuarioId) {
      alert("Usuário não autenticado. Faça login novamente.");
      setLoading(false);
      navigate("/"); // volta pro login
      return;
    }

    try {
      const payload = { nome, urlFoto: fotoSelecionada, usuarioId };
      const response = await fetch("http://localhost:8080/perfis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert("Perfil criado com sucesso!");
        setNome("");
        setFotoSelecionada(null);
        navigate("/meus-perfis"); // volta pra tela de perfis
      } else if (response.status === 401) {
        alert("Usuário não autenticado. Faça login novamente.");
        navigate("/"); // volta pro login
      } else {
        const errorData = await response.json();
        alert("Erro ao criar perfil: " + (errorData.message || "Tente novamente"));
      }
    } catch (error) {
      console.error("Erro ao criar perfil:", error);
      alert("Erro ao criar perfil. Tente novamente.");
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#a3cee6] p-4">
      <div className="bg-[#67B5DF] backdrop-blur-md p-8 md:p-12 rounded-3xl shadow-2xl w-full max-w-md text-white border-2 border-white/30">
        <h1 className="text-3xl font-extrabold mb-6 text-center text-white">Criar Perfil</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            placeholder="Nome do perfil"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full px-4 py-3 rounded-lg text-[#004687] placeholder-[#67B5DF] focus:outline-none focus:ring-2 focus:ring-white bg-white"
            required
          />

          <p className="text-white font-semibold mt-2">Escolha uma imagem de perfil:</p>
          <div className="flex flex-wrap gap-4 justify-center mt-2">
            {imagensPapagaiando.map((img, idx) => (
              <img
                key={idx}
                src={img.url}
                alt={img.nome}
                className={`w-24 h-24 rounded-xl cursor-pointer border-4 transition-transform transform hover:scale-105 ${
                  fotoSelecionada === img.url ? "border-white" : "border-white/50"
                }`}
                onClick={() => setFotoSelecionada(img.url)}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#004687] hover:bg-[#003366] transition font-semibold py-3 rounded-lg shadow-lg mt-4 text-white"
          >
            {loading ? "Criando..." : "Criar Perfil"}
          </button>
        </form>
      </div>
    </div>
  );
}