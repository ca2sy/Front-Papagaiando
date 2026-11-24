import { useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../services/supabase";
import { API_BASE_URL, getApiError } from "../../services/api";
import { Spinner } from "../../components/Carregando";
import BotaoVoltar from "../../components/BotaoVoltar";
import { useVoltar } from "../../services/navegacao";

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
    <div className="min-h-screen bg-[#b3daff] p-4">
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-[#ffffff] backdrop-blur-md p-8 md:p-12 rounded-3xl shadow-2xl w-full max-w-md text-[#004687] border-2 border-white/30">
          <div className="mb-6">
            <BotaoVoltar onClick={handleVoltar} disabled={loading} />
            <h1 className="mt-4 text-3xl font-extrabold text-center text-[#004687]">
              Criar Categoria
            </h1>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-base font-medium mb-2 text-[#004687]">
                Nome da Categoria
              </label>
              <input
                type="text"
                placeholder="Ex: Animais, Cores, etc."
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full px-4 py-3 rounded-lg text-[#004687] placeholder-[#004687] border-2 border-[#004687] focus:outline-none focus:ring-2 focus:ring-white bg-white"
                disabled={loading}
                required
              />
            </div>

            <div>
              <label className="block text-base font-medium mb-2 text-[#004687]">
                Imagem da Categoria
              </label>
              <div className="border-2 border-dashed border-[#004687] rounded-lg p-6 text-center cursor-pointer hover:border-white transition">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImagemChange}
                  className="hidden"
                  id="imagem-input"
                  disabled={loading}
                />
                <label htmlFor="imagem-input" className="cursor-pointer block">
                  {previewImagem ? (
                    <div className="space-y-3">
                      <img
                        src={previewImagem}
                        alt="Preview"
                        className="w-32 h-32 object-contain rounded-lg mx-auto"
                      />
                      <p className="text-sm text-[#004687]/80">
                        Clique para alterar imagem
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <svg
                        className="mx-auto h-12 w-12 text-white/60"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20a4 4 0 004 4h24a4 4 0 004-4V16a4 4 0 00-4-4z"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <circle
                          cx="20"
                          cy="20"
                          r="3"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M44 24l-8-8-16 16-8-8"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <p className="text-sm font-medium">
                        Clique para fazer upload da imagem
                      </p>
                      <p className="text-xs text-[#004687]/80">
                        PNG, JPG, GIF até 5MB
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {erro && (
              <div className="bg-red-500/20 border border-red-400 text-white px-4 py-3 rounded-lg text-sm">
                {erro}
              </div>
            )}

            {sucesso && (
              <div className="bg-green-500/20 border border-green-400 text-white px-4 py-3 rounded-lg text-sm">
                Categoria criada com sucesso!
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#004687] hover:bg-[#003366] transition font-semibold py-3 rounded-lg shadow-lg disabled:opacity-70 disabled:cursor-not-allowed text-white"
            >
              {loading && <Spinner tamanho={18} />}
              <span>
                {loading ? "Criando categoria..." : "Criar Categoria"}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
