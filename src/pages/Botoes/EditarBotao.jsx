import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL, getApiError } from "../../services/api";
import TelaCarregando, { Spinner } from "../../components/Carregando";
import BotaoVoltar from "../../components/BotaoVoltar";
import CampoImagem from "../../components/CampoImagem";
import { enviarImagem } from "../../services/supabase";

export default function EditarBotao() {
  const { perfilId, categoriaId, botaoId } = useParams();
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [urlImagem, setUrlImagem] = useState("");
  const [arquivoImagem, setArquivoImagem] = useState(null);
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

    if (!nome.trim() || (!urlImagem.trim() && !arquivoImagem) || !urlAudio.trim()) {
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

      const imagemFinal = arquivoImagem
        ? await enviarImagem(`botoes/perfil-${perfilId}`, arquivoImagem)
        : urlImagem.trim();

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
            urlImagem: imagemFinal,
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
    return <TelaCarregando texto="Carregando botão..." />;
  }

  return (
    <div className="min-h-screen bg-[#b3daff] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">
        <div className="mb-6">
            <BotaoVoltar onClick={voltar} disabled={salvando} />
            <h1 className="mt-4 text-3xl font-extrabold text-center text-[#004687]">Editar Botão</h1>
          </div>

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
            <CampoImagem
              rotulo="Imagem do botão"
              url={urlImagem}
              onUrlChange={setUrlImagem}
              arquivo={arquivoImagem}
              onArquivoChange={setArquivoImagem}
              onErro={setErro}
              disabled={salvando}
            />
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
              className="flex-1 p-3 rounded-lg border-2 border-[#004687] font-semibold text-[#004687] hover:bg-blue-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={salvando || loading}
              className="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg bg-[#004687] text-white disabled:opacity-70"
            >
              {salvando && <Spinner tamanho={18} />}
              {salvando ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}