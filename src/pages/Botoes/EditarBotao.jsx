import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL, getApiError } from "../../services/api";

export default function EditarBotao() {
  const { perfilId, categoriaId, botaoId } = useParams();
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [urlImagem, setUrlImagem] = useState("");
  const [urlAudio, setUrlAudio] = useState("");
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const voltar = () => {
    navigate(`/perfil/${perfilId}/categoria/${categoriaId}`);
  };

  useEffect(() => {
    const carregarBotao = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/");
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/botoes/${botaoId}?perfilId=${encodeURIComponent(perfilId)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            await getApiError(
              response,
              "Não foi possível carregar o botão."
            )
          );
        }

        const botao = await response.json();

        setNome(botao.nome || "");
        setUrlImagem(botao.urlImagem || "");
        setUrlAudio(botao.urlAudio || "");
      } catch (error) {
        setErro(error.message);
      } finally {
        setLoading(false);
      }
    };

    carregarBotao();
  }, [botaoId, perfilId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");

    if (!nome.trim() || !urlImagem.trim() || !urlAudio.trim()) {
      setErro("Preencha todos os campos.");
      return;
    }

    setSalvando(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/botoes/${botaoId}?perfilId=${encodeURIComponent(perfilId)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            nome: nome.trim(),
            urlImagem: urlImagem.trim(),
            urlAudio: urlAudio.trim(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          await getApiError(
            response,
            "Não foi possível atualizar o botão."
          )
        );
      }

      voltar();
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#b3daff] flex items-center justify-center">
        <p className="text-[#004687]">Carregando botão...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#b3daff] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-[#004687] mb-6 text-center">
          Editar Botão
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="nome"
              className="block text-[#004687] font-medium mb-2"
            >
              Nome do botão
            </label>

            <input
              id="nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              disabled={salvando}
              required
              className="w-full p-3 rounded-lg border-2 border-[#004687]"
            />
          </div>

          <div>
            <label
              htmlFor="urlImagem"
              className="block text-[#004687] font-medium mb-2"
            >
              URL da imagem
            </label>

            <input
              id="urlImagem"
              type="url"
              value={urlImagem}
              onChange={(e) => setUrlImagem(e.target.value)}
              disabled={salvando}
              required
              className="w-full p-3 rounded-lg border-2 border-[#004687]"
            />

            {urlImagem && (
              <img
                src={urlImagem}
                alt="Prévia do botão"
                className="w-32 h-32 object-contain rounded-lg mx-auto mt-4"
              />
            )}
          </div>

          <div>
            <label
              htmlFor="urlAudio"
              className="block text-[#004687] font-medium mb-2"
            >
              URL do áudio
            </label>

            <input
              id="urlAudio"
              type="url"
              value={urlAudio}
              onChange={(e) => setUrlAudio(e.target.value)}
              disabled={salvando}
              required
              className="w-full p-3 rounded-lg border-2 border-[#004687]"
            />

            {urlAudio && (
              <audio
                controls
                src={urlAudio}
                className="w-full mt-3"
              />
            )}
          </div>

          {erro && (
            <p role="alert" className="text-red-600 text-sm">
              {erro}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={voltar}
              disabled={salvando}
              className="flex-1 p-3 rounded-lg border-2 border-[#004687] text-[#004687]"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={salvando || loading}
              className="flex-1 p-3 rounded-lg bg-[#004687] text-white disabled:opacity-50"
            >
              {salvando ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}