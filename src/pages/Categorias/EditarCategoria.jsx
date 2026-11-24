import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL, getApiError } from "../../services/api";
import TelaCarregando, { Spinner } from "../../components/Carregando";
import BotaoVoltar from "../../components/BotaoVoltar";
import { useVoltar } from "../../services/navegacao";
import CampoImagem from "../../components/CampoImagem";
import { enviarImagem } from "../../services/supabase";

export default function EditarCategoria() {
  const { perfilId, categoriaId } = useParams();
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [urlImagem, setUrlImagem] = useState("");
  const [arquivoImagem, setArquivoImagem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const voltar = useVoltar(`/perfil/${perfilId}/categorias`);

  useEffect(() => {
    const carregarCategoria = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/", { replace: true });
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/categorias/${categoriaId}?perfilId=${encodeURIComponent(perfilId)}`,
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
              "Não foi possível carregar a categoria."
            )
          );
        }

        const categoria = await response.json();

        setNome(categoria.nome);
        setUrlImagem(categoria.urlImagem || "");
      } catch (error) {
        setErro(error.message);
      } finally {
        setLoading(false);
      }
    };

    carregarCategoria();
  }, [categoriaId, perfilId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");

    if (!nome.trim()) {
      setErro("Informe o nome da categoria.");
      return;
    }

    if (!urlImagem.trim() && !arquivoImagem) {
      setErro("Escolha uma imagem ou cole um link.");
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
        ? await enviarImagem(`categorias/perfil-${perfilId}`, arquivoImagem)
        : urlImagem.trim();

      const response = await fetch(
        `${API_BASE_URL}/categorias/${categoriaId}?perfilId=${encodeURIComponent(perfilId)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            nome: nome.trim(),
            urlImagem: imagemFinal,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          await getApiError(
            response,
            "Não foi possível atualizar a categoria."
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
    return <TelaCarregando texto="Carregando categoria..." />;
  }

  return (
    <div className="min-h-screen bg-[#b3daff] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">
        <div className="mb-6">
            <BotaoVoltar onClick={voltar} disabled={salvando} />
            <h1 className="mt-4 text-3xl font-extrabold text-center text-[#004687]">Editar Categoria</h1>
          </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="nome"
              className="block text-[#004687] font-medium mb-2"
            >
              Nome da categoria
            </label>

            <input
              id="nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              disabled={salvando}
              className="w-full p-3 rounded-lg border-2 border-[#004687] text-[#004687]"
              required
            />
          </div>

          <div>
            <CampoImagem
              rotulo="Imagem da categoria"
              url={urlImagem}
              onUrlChange={setUrlImagem}
              arquivo={arquivoImagem}
              onArquivoChange={setArquivoImagem}
              onErro={setErro}
              disabled={salvando}
            />
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
              className="flex-1 p-3 rounded-lg border-2 border-[#004687] font-semibold text-[#004687] hover:bg-blue-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={salvando}
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