import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SenhaModal from "../../components/SenhaModal.jsx";
import api, { mensagemDeErro } from "../../services/api";
import { uploadArquivo } from "../../services/supabase";

export default function EditarCategoria() {
  const [categoria, setCategoria] = useState(null);
  const [nome, setNome] = useState("");
  const [imagemSelecionada, setImagemSelecionada] = useState(null);
  const [previewImagem, setPreviewImagem] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [showSenhaModal, setShowSenhaModal] = useState(false);
  const [acaoSelecionada, setAcaoSelecionada] = useState(null);

  const navigate = useNavigate();
  const { perfilId, categoriaId } = useParams();

  useEffect(() => {
    const buscarCategoria = async () => {
      try {
        const { data } = await api.get(`/categorias/${categoriaId}`, {
          params: { perfilId },
        });
        setCategoria(data);
        setNome(data.nome);
        setPreviewImagem(data.urlImagem);
      } catch (error) {
        console.error("Erro ao carregar categoria:", error);
        alert(mensagemDeErro(error, "Erro ao carregar categoria"));
        navigate(`/perfil/${perfilId}/categorias`);
      } finally {
        setCarregando(false);
      }
    };

    buscarCategoria();
  }, [perfilId, categoriaId, navigate]);

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

  const handleVoltar = () => {
    navigate(`/perfil/${perfilId}/categorias`);
  };

  const pedirSenha = (acao) => {
    setAcaoSelecionada(acao);
    setShowSenhaModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!nome.trim()) {
      setErro("Por favor, digite o nome da categoria");
      return;
    }

    pedirSenha("salvar");
  };

  const salvar = async () => {
    setLoading(true);
    setErro("");

    try {
      const payload = { nome };

      if (imagemSelecionada) {
        payload.urlImagem = await uploadArquivo(
          "papagaiando-imagens",
          `categorias/perfil-${perfilId}/${Date.now()}_${imagemSelecionada.name}`,
          imagemSelecionada
        );
      }

      await api.put(`/categorias/${categoriaId}`, payload, {
        params: { perfilId },
      });

      alert("Categoria atualizada com sucesso!");
      navigate(`/perfil/${perfilId}/categorias`);
    } catch (error) {
      console.error("Erro ao atualizar categoria:", error);
      setErro(mensagemDeErro(error, "Erro ao atualizar categoria. Tente novamente."));
    } finally {
      setLoading(false);
    }
  };

  const restaurar = async () => {
    setLoading(true);
    setErro("");

    try {
      const { data } = await api.post(`/categorias/${categoriaId}/restaurar`, null, {
        params: { perfilId },
      });

      setCategoria(data);
      setNome(data.nome);
      setPreviewImagem(data.urlImagem);
      setImagemSelecionada(null);
      alert("Categoria restaurada para o padrão!");
    } catch (error) {
      console.error("Erro ao restaurar categoria:", error);
      setErro(mensagemDeErro(error, "Erro ao restaurar categoria. Tente novamente."));
    } finally {
      setLoading(false);
    }
  };

  const excluir = async () => {
    setLoading(true);
    setErro("");

    try {
      await api.delete(`/categorias/${categoriaId}`);

      alert("Categoria excluída com sucesso!");
      navigate(`/perfil/${perfilId}/categorias`);
    } catch (error) {
      console.error("Erro ao excluir categoria:", error);
      setErro(mensagemDeErro(error, "Erro ao excluir categoria. Tente novamente."));
    } finally {
      setLoading(false);
    }
  };

  const handleSenhaConfirmada = () => {
    setShowSenhaModal(false);

    switch (acaoSelecionada) {
      case "salvar":
        salvar();
        break;

      case "restaurar":
        restaurar();
        break;

      case "excluir":
        excluir();
        break;

      default:
        break;
    }
  };

  if (carregando) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#b3daff]">
        <p className="text-xl text-[#004687]">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#b3daff] p-4">
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-[#ffffff] backdrop-blur-md p-8 md:p-12 rounded-3xl shadow-2xl w-full max-w-md text-[#004687] border-2 border-white/30">
          <div className="flex items-center mb-6">
            <button
              onClick={handleVoltar}
              className="text-[#004687] hover:text-blue-100 mr-4 disabled:opacity-50"
              disabled={loading}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <h1 className="text-3xl font-extrabold">Editar Categoria</h1>
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
                <label
                  htmlFor="imagem-input"
                  className="cursor-pointer block"
                >
                  <div className="space-y-3">
                    <img
                      src={previewImagem}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg mx-auto"
                    />
                    <p className="text-sm text-[#004687]/80">
                      Clique para alterar imagem
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {erro && (
              <div className="bg-red-500/20 border border-red-400 text-[#004687] px-4 py-3 rounded-lg text-sm">
                {erro}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#004687] hover:bg-[#003366] transition font-semibold py-3 rounded-lg shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed text-white"
            >
              {loading ? "Salvando..." : "Salvar Alterações"}
            </button>
          </form>

          {categoria?.padrao && categoria?.personalizado && (
            <button
              onClick={() => pedirSenha("restaurar")}
              disabled={loading}
              className="w-full bg-[#004687] hover:bg-[#003366] transition font-semibold py-3 rounded-lg shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed text-white mt-4"
            >
              Restaurar Padrão
            </button>
          )}

          {categoria && !categoria.padrao && (
            <button
              onClick={() => pedirSenha("excluir")}
              disabled={loading}
              className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-center font-medium mt-4 rounded-lg"
            >
              Excluir Categoria
            </button>
          )}
        </div>
      </div>

      <SenhaModal
        isOpen={showSenhaModal}
        onClose={() => setShowSenhaModal(false)}
        onConfirm={handleSenhaConfirmada}
        titulo="Confirmar ação"
        mensagem="Por favor, digite sua senha para continuar:"
      />
    </div>
  );
}
