import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL, getApiError } from "../../services/api";
import TelaCarregando, { Spinner } from "../../components/Carregando";
import BotaoVoltar from "../../components/BotaoVoltar";
import { useVoltar } from "../../services/navegacao";
import CampoImagem from "../../components/CampoImagem";
import { enviarImagem, enviarAudio } from "../../services/supabase";
import CampoAudio from "../../components/CampoAudio";
import { atualizarFavorito } from "../../services/favoritos";

export default function EditarBotao() {
  const { perfilId, categoriaId, botaoId } = useParams();
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [urlImagem, setUrlImagem] = useState("");
  const [arquivoImagem, setArquivoImagem] = useState(null);
  const [urlAudio, setUrlAudio] = useState("");
  const [gravacaoAudio, setGravacaoAudio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const voltar = useVoltar(`/perfil/${perfilId}/categoria/${categoriaId}`);

  useEffect(() => {
    const carregarBotao = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/", { replace: true });
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

    if (!nome.trim() || (!urlImagem.trim() && !arquivoImagem)) {
      setErro("Preencha o nome e escolha uma imagem.");
      return;
    }

    if (!urlAudio.trim() && !gravacaoAudio) {
      setErro("Grave um áudio ou cole o link de um áudio.");
      return;
    }

    setSalvando(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/", { replace: true });
        return;
      }

      const imagemFinal = arquivoImagem
        ? await enviarImagem(`botoes/perfil-${perfilId}`, arquivoImagem)
        : urlImagem.trim();

      const audioFinal = gravacaoAudio
        ? await enviarAudio(`botoes/perfil-${perfilId}`, gravacaoAudio)
        : urlAudio.trim();

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
            urlAudio: audioFinal,
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

      atualizarFavorito(perfilId, botaoId, {
        nome: nome.trim(),
        urlImagem: imagemFinal,
        urlAudio: audioFinal,
      });

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

          <CampoAudio
            rotulo="Áudio do botão"
            url={urlAudio}
            onUrlChange={setUrlAudio}
            gravacao={gravacaoAudio}
            onGravacaoChange={setGravacaoAudio}
            onErro={setErro}
            disabled={salvando}
          />

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
              <span>{salvando ? "Salvando..." : "Salvar"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}