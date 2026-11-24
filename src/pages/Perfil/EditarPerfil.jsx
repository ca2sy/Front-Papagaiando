import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL, getApiError } from "../../services/api";

import { aviso } from "../../components/Aviso";
import BotaoVoltar from "../../components/BotaoVoltar";
import { useVoltar } from "../../services/navegacao";

import TelaCarregando, { Spinner } from "../../components/Carregando";

export default function EditarPerfil() {
  const [nome, setNome] = useState("");
  const [fotoSelecionada, setFotoSelecionada] = useState(null);
  const [loading, setLoading] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const navigate = useNavigate();
  const { perfilId } = useParams();
  const voltar = useVoltar(`/perfil/${perfilId}/categorias`);

  const imagensPapagaiando = [
    { nome: "verde", url: "https://bkueynyjbvxuavboqnja.supabase.co/storage/v1/object/public/perfil/papagaiando-verd.jpg" },
    { nome: "roxo", url: "https://bkueynyjbvxuavboqnja.supabase.co/storage/v1/object/public/perfil/papagaiando-roxo.jpg" },
    { nome: "rosa", url: "https://bkueynyjbvxuavboqnja.supabase.co/storage/v1/object/public/perfil/papagaiando-rosa.jpg" },
    { nome: "azul", url: "https://bkueynyjbvxuavboqnja.supabase.co/storage/v1/object/public/perfil/papagaiando-azul.jpg" }
  ];

  useEffect(() => {
    const buscarPerfil = async () => {
      const token = localStorage.getItem("token");
      if (!token || !perfilId) {
        navigate("/", { replace: true });
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/perfis/${perfilId}`, {
          headers: { Authorization: "Bearer " + token }
        });

        if (response.ok) {
          const perfil = await response.json();
          setNome(perfil.nome);
          setFotoSelecionada(perfil.urlFoto);
        } else {
        const mensagem = await getApiError(
          response,
          "Não foi possível carregar o perfil."
        );

        aviso(mensagem, "erro");
        navigate(response.status === 401 ? "/" : "/meus-perfis", { replace: true });
      }
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
        aviso("Erro ao carregar perfil", "erro");
      } finally {
        setCarregando(false);
      }
    };

    buscarPerfil();
  }, [perfilId, navigate]);

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
      navigate("/", { replace: true });
      return;
    }

    try {
      const payload = { nome, urlFoto: fotoSelecionada };
      const response = await fetch(`${API_BASE_URL}/perfis/${perfilId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        aviso("Perfil atualizado com sucesso!", "sucesso");
        voltar();
      } else if (response.status === 401) {
        aviso("Usuário não autenticado. Faça login novamente.", "erro");
        navigate("/", { replace: true });
      } else {
        const mensagem = await getApiError(
          response,
          "Não foi possível atualizar o perfil."
        );

        aviso("Erro ao atualizar perfil: " + mensagem, "erro");
      }
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      aviso("Erro ao atualizar perfil. Tente novamente.", "erro");
    }
    setLoading(false);
  };

  const handleVoltar = voltar;

  if (carregando) {
    return <TelaCarregando texto="Carregando perfil..." />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#b3daff] p-4">
      <div className="bg-[#ffffff] backdrop-blur-md p-8 md:p-12 rounded-3xl shadow-2xl w-full max-w-md text-[#004687] border-2 border-[#004687]/30">
        <div className="mb-6">
            <BotaoVoltar onClick={handleVoltar} />
            <h1 className="mt-4 text-3xl font-extrabold text-center text-[#004687]">Editar Perfil</h1>
          </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            placeholder="Nome do perfil"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full px-4 py-3 rounded-lg text-[#004687] placeholder-[#67B5DF] focus:outline-none focus:ring-2 focus:ring-white bg-white border-2 border-[#004687]"
            required
          />

          <p className="text-[#004687] font-semibold mt-2">Escolha uma imagem de perfil:</p>
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
            className="w-full flex items-center justify-center gap-2 bg-[#004687] hover:bg-[#003366] transition font-semibold py-3 rounded-lg shadow-lg mt-4 text-white disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading && <Spinner tamanho={18} />}
            <span>{loading ? "Salvando..." : "Salvar Alterações"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}