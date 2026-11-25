import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL, getApiError } from "../../services/api";
import TelaCarregando, { Spinner } from "../../components/Carregando";
import BotaoVoltar from "../../components/BotaoVoltar";
import { useVoltar } from "../../services/navegacao";
import CampoImagem from "../../components/CampoImagem";
import { enviarImagem } from "../../services/supabase";
import papagaiandoImg from "../../assets/papagaiando.jpg";

export default function EditarCategoria() {
  const { perfilId, categoriaId } = useParams();
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [urlImagem, setUrlImagem] = useState("");
  const [arquivoImagem, setArquivoImagem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [previewImagem, setPreviewImagem] = useState("");

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
          },
        );

        if (!response.ok) {
          throw new Error(
            await getApiError(
              response,
              "Não foi possível carregar a categoria.",
            ),
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

  useEffect(() => {
    if (!arquivoImagem) {
      setPreviewImagem(urlImagem);
      return;
    }

    const urlTemporaria = URL.createObjectURL(arquivoImagem);
    setPreviewImagem(urlTemporaria);

    return () => URL.revokeObjectURL(urlTemporaria);
  }, [arquivoImagem, urlImagem]);

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
        },
      );

      if (!response.ok) {
        throw new Error(
          await getApiError(
            response,
            "Não foi possível atualizar a categoria.",
          ),
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
    <div className="min-h-screen bg-[#F8F5F3]">
      <header className="bg-[#365FB3] text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 sm:px-8">
          <div className="flex items-center gap-3">
            <img
              src={papagaiandoImg}
              alt=""
              className="h-11 w-11 rounded-xl object-cover"
            />
            <span className="text-xl font-bold">Papagaiando</span>
          </div>

          <span className="text-sm font-medium">Área do responsável</span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-5 pb-12 pt-8 sm:px-8 sm:pt-10">
        <button
          type="button"
          onClick={voltar}
          disabled={salvando}
          className="mb-5 text-sm font-semibold text-[#365FB3] hover:underline disabled:opacity-60"
        >
          ‹ Gerenciar categorias
        </button>

        <h1 className="mb-8 text-3xl font-bold text-[#1F3F80] sm:text-4xl">
          Editar categoria
        </h1>

        <form
          onSubmit={handleSubmit}
          className="grid items-stretch gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,1fr)]"
        >
          <section className="flex flex-col rounded-3xl bg-white p-6 sm:p-8">
            <div>
              <label
                htmlFor="nome"
                className="mb-2 block font-semibold text-[#1F3F80]"
              >
                Nome da categoria
              </label>

              <input
                id="nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                disabled={salvando}
                required
                className="w-full rounded-xl border border-[#A8BED6] bg-white px-4 py-3 text-[#1F3F80] outline-none focus:border-[#365FB3] focus:ring-2 focus:ring-[#365FB3]/20"
              />
            </div>

            <div className="mt-7">
              <CampoImagem
                rotulo="Imagem da categoria"
                url={urlImagem}
                onUrlChange={setUrlImagem}
                arquivo={arquivoImagem}
                onArquivoChange={setArquivoImagem}
                onErro={setErro}
                disabled={salvando}
                mostrarPrevia={false}
              />
            </div>

            {erro && (
              <p
                role="alert"
                className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {erro}
              </p>
            )}

            <div className="mt-auto flex flex-wrap gap-3 pt-10">
              <button
                type="submit"
                disabled={salvando}
                className="flex min-w-[170px] items-center justify-center gap-2 rounded-xl bg-[#365FB3] px-6 py-3 font-semibold text-white transition hover:bg-[#1F3F80] disabled:opacity-60"
              >
                {salvando && <Spinner tamanho={18} />}
                {salvando ? "Salvando..." : "Salvar alterações"}
              </button>

              <button
                type="button"
                onClick={voltar}
                disabled={salvando}
                className="rounded-xl border border-[#A8BED6] bg-white px-6 py-3 font-semibold text-[#365FB3] transition hover:bg-[#F8F5F3] disabled:opacity-60"
              >
                Cancelar
              </button>
            </div>
          </section>

          <aside className="flex flex-col rounded-3xl bg-[#CFE5F5] p-6 sm:p-8">
            <h2 className="text-xl font-bold text-[#1F3F80]">Prévia</h2>

            <div className="flex flex-1 flex-col items-center justify-center gap-4 py-8">
              <div className="flex aspect-[5/4] w-full max-w-[250px] items-center justify-center overflow-hidden rounded-2xl border border-[#A8BED6] bg-white p-5">
                {previewImagem ? (
                  <img
                    src={previewImagem}
                    alt="Prévia da imagem da categoria"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-center text-[#617A98]">
                    <svg
                      width="42"
                      height="42"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="m21 15-5-5L5 21" />
                    </svg>

                    <span className="text-sm">Nenhuma imagem selecionada</span>
                  </div>
                )}
              </div>

              <p className="max-w-full break-words text-center text-lg font-semibold text-[#1F3F80]">
                {nome.trim() || "Nome da categoria"}
              </p>
            </div>
          </aside>
        </form>
      </main>
    </div>
  );
}
