import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, getApiError } from "../../services/api";
import { aviso } from "../../components/Aviso";
import BotaoVoltar from "../../components/BotaoVoltar";
import { Spinner } from "../../components/Carregando";

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
      aviso("Preencha o nome e escolha uma imagem", "erro");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("token");

    if (!token) {
      aviso("Usuário não autenticado. Faça login novamente.", "erro");
      setLoading(false);
      navigate("/"); // volta pro login
      return;
    }

    try {
      const payload = { nome, urlFoto: fotoSelecionada };

      const response = await fetch(`${API_BASE_URL}/perfis`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        aviso("Perfil criado com sucesso!", "sucesso");
        setNome("");
        setFotoSelecionada(null);
        navigate("/meus-perfis"); // volta pra tela de perfis
      } else if (response.status === 401) {
        aviso("Usuário não autenticado. Faça login novamente.", "erro");
        navigate("/"); // volta pro login
      } else {
        const mensagem = await getApiError(
          response,
          "Não foi possível criar o perfil."
        );
        aviso("Erro ao criar perfil: " + mensagem, "erro");
      }
    } catch (error) {
      console.error("Erro ao criar perfil:", error);
      aviso("Erro ao criar perfil. Tente novamente.", "erro");
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#b3daff] p-4">
      <div className="bg-[#ffffff] backdrop-blur-md p-8 md:p-12 rounded-3xl shadow-2xl w-full max-w-md text-white border-2 border-white/30">
        <div className="mb-6">
            <BotaoVoltar onClick={() => navigate("/meus-perfis")} />
            <h1 className="mt-4 text-3xl font-extrabold text-center text-[#004687]">Criar Perfil</h1>
          </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            placeholder="Nome do perfil"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full px-4 py-3 rounded-lg text-[#004687] placeholder-[#004687] focus:outline-none focus:ring-2 focus:ring-white bg-white border-2 border-[#004687]"
            required
          />

          <p className="text-[#004687] font-semibold mt-2">Escolha uma imagem de perfil:</p>
          <div className="flex flex-wrap gap-4 justify-center mt-2">
            {imagensPapagaiando.map((img, idx) => (
              <img
                key={idx}
                src={img.url}
                alt={img.nome}
                className={`w-24 h-24 rounded-xl cursor-pointer border-2 transition-transform transform hover:scale-105 ${
                  fotoSelecionada === img.url ? "border-[#004687]" : "border-[#004687]/50"
                }`}
                onClick={() => setFotoSelecionada(img.url)}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#004687] hover:bg-[#003366] transition font-semibold py-3 rounded-lg shadow-lg mt-4 text-white disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading && <Spinner tamanho={18} />}
            {loading ? "Criando..." : "Criar Perfil"}
          </button>
        </form>
      </div>
    </div>
  );
}