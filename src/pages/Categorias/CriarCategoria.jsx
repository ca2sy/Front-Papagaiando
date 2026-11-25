import { useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../services/supabase";
import { API_BASE_URL, getApiError } from "../../services/api";
import { Spinner } from "../../components/Carregando";
import BotaoVoltar from "../../components/BotaoVoltar";
import { useVoltar } from "../../services/navegacao";
import papagaiandoImg from "../../assets/papagaiando.jpg";

export default function CriarCategoria() {
  const [nome, setNome] = useState("");
  const [imagemSelecionada, setImagemSelecionada] = useState(null);
  const [previewImagem, setPreviewImagem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  const { perfilId } = useParams();
  const voltar = useVoltar(`/perfil/${perfilId}/categorias`);

  const handleImagemChange = (e) => {
    const arquivo = e.target.files[0];
    if (arquivo) {
      if (!arquivo.type.startsWith("image/")) {
        setErro("Por favor, selecione um arquivo de imagem válido");
        return;
      }
      if (arquivo.size > 5 * 1024 * 1024) {
        setErro("A imagem não pode ser maior que 5MB");
        return;
      }
      setImagemSelecionada(arquivo);
      setPreviewImagem(URL.createObjectURL(arquivo));
      setErro("");
    }
  };

  const handleVoltar = voltar;

  const uploadImagemSupabase = async (arquivo) => {
    const nomeArquivo = `${Date.now()}_${arquivo.name}`;
    const caminhoUpload = `categorias/perfil-${perfilId}/${nomeArquivo}`;

    const { error } = await supabase.storage
      .from("papagaiando-imagens")
      .upload(caminhoUpload, arquivo);

    if (error) {
      throw new Error(`Erro ao fazer upload da imagem: ${error.message}`);
    }

    const { data: urlData } = supabase.storage
      .from("papagaiando-imagens")
      .getPublicUrl(caminhoUpload);

    return urlData.publicUrl;
  };

  const salvarCategoriaBackend = async (urlImagem) => {
    const token = localStorage.getItem("token");

    const payload = {
      nome: nome,
      urlImagem: urlImagem,
      perfilId: perfilId,
    };

    const response = await fetch(`${API_BASE_URL}/categorias`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const mensagem = await getApiError(
        response,
        "Não foi possível criar a categoria.",
      );

      throw new Error(mensagem);
    }

    return await response.json();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nome.trim()) {
      setErro("Por favor, digite o nome da categoria");
      return;
    }

    if (!imagemSelecionada) {
      setErro("Por favor, selecione uma imagem");
      return;
    }

    setLoading(true);
    setErro("");
    setSucesso(false);

    try {
      const urlImagem = await uploadImagemSupabase(imagemSelecionada);
      await salvarCategoriaBackend(urlImagem);

      setSucesso(true);
      setTimeout(voltar, 1500);
    } catch (error) {
      console.error("Erro:", error);
      setErro(error.message || "Erro ao criar categoria. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

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
          onClick={handleVoltar}
          disabled={loading}
          className="mb-5 text-sm font-semibold text-[#365FB3] hover:underline disabled:opacity-60"
        >
          ‹ Gerenciar categorias
        </button>

        <h1 className="mb-8 text-3xl font-bold text-[#1F3F80] sm:text-4xl">
          Criar categoria
        </h1>

        <form
          onSubmit={handleSubmit}
          className="grid items-stretch gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,1fr)]"
        >
          <section className="flex flex-col rounded-3xl bg-white p-6 sm:p-8">
            <div>
              <label
                htmlFor="nome-categoria"
                className="mb-2 block font-semibold text-[#1F3F80]"
              >
                Nome da categoria
              </label>
              <input
                id="nome-categoria"
                type="text"
                placeholder="Ex.: Animais, Cores, Alimentação..."
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                disabled={loading}
                required
                className="w-full rounded-xl border border-[#A8BED6] bg-white px-4 py-3 text-[#1F3F80] outline-none focus:border-[#365FB3] focus:ring-2 focus:ring-[#365FB3]/20"
              />
            </div>

            <div className="mt-7">
              <p className="mb-3 font-semibold text-[#1F3F80]">
                Imagem da categoria
              </p>

              <input
                id="imagem-input"
                type="file"
                accept="image/*"
                onChange={handleImagemChange}
                disabled={loading}
                className="sr-only"
              />

              <label
                htmlFor="imagem-input"
                className={`flex min-h-36 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[#A8BED6] bg-[#F8F5F3] p-5 text-center transition hover:border-[#365FB3] ${
                  loading ? "pointer-events-none opacity-60" : "cursor-pointer"
                }`}
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#365FB3"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 16V4m0 0L7 9m5-5 5 5" />
                  <path d="M4 16v3a2 2 0 002 2h12a2 2 0 002-2v-3" />
                </svg>

                <span className="font-semibold text-[#365FB3]">
                  {imagemSelecionada
                    ? "Trocar imagem"
                    : "Escolher imagem do dispositivo"}
                </span>

                <span className="max-w-full break-all text-sm text-[#617A98]">
                  {imagemSelecionada
                    ? imagemSelecionada.name
                    : "PNG, JPG ou GIF até 5 MB"}
                </span>
              </label>
            </div>

            {erro && (
              <p
                role="alert"
                className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {erro}
              </p>
            )}

            {sucesso && (
              <p
                role="status"
                className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
              >
                Categoria criada com sucesso!
              </p>
            )}

            <div className="mt-auto flex flex-wrap gap-3 pt-10">
              <button
                type="submit"
                disabled={loading}
                className="flex min-w-[170px] items-center justify-center gap-2 rounded-xl bg-[#365FB3] px-6 py-3 font-semibold text-white transition hover:bg-[#1F3F80] disabled:opacity-60"
              >
                {loading && <Spinner tamanho={18} />}
                {loading ? "Criando..." : "Criar categoria"}
              </button>

              <button
                type="button"
                onClick={handleVoltar}
                disabled={loading}
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