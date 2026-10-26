import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SenhaModal from "../../components/SenhaModal.jsx";
import api, { mensagemDeErro } from "../../services/api";
import { uploadArquivo } from "../../services/supabase";
import { atualizarFavorito, removerFavorito } from "../../utils/favoritos";

export default function EditarBotao() {
  const [botao, setBotao] = useState(null);
  const [nome, setNome] = useState("");
  const [imagemSelecionada, setImagemSelecionada] = useState(null);
  const [previewImagem, setPreviewImagem] = useState(null);
  const [audioSelecionado, setAudioSelecionado] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [showSenhaModal, setShowSenhaModal] = useState(false);
  const [acaoSelecionada, setAcaoSelecionada] = useState(null);

  const navigate = useNavigate();
  const { perfilId, botaoId } = useParams();

  useEffect(() => {
    const buscarBotao = async () => {
      try {
        const { data } = await api.get(`/botoes/${botaoId}`, {
          params: { perfilId },
        });
        setBotao(data);
        setNome(data.nome);
        setPreviewImagem(data.urlImagem);
        setAudioUrl(data.urlAudio);
      } catch (error) {
        console.error("Erro ao carregar botão:", error);
        alert(mensagemDeErro(error, "Erro ao carregar botão"));
        navigate(`/perfil/${perfilId}/categorias`);
      } finally {
        setCarregando(false);
      }
    };

    buscarBotao();
  }, [perfilId, botaoId, navigate]);

  const voltarParaCategoria = () => {
    if (botao) {
      navigate(`/perfil/${perfilId}/categoria/${botao.categoriaId}`);
    } else {
      navigate(`/perfil/${perfilId}/categorias`);
    }
  };

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

  const handleAudioChange = (e) => {
    const arquivo = e.target.files[0];
    if (arquivo) {
      if (!arquivo.type.startsWith("audio/")) {
        setErro("Por favor, selecione um arquivo de áudio válido");
        return;
      }
      setAudioSelecionado(arquivo);
      setAudioUrl(URL.createObjectURL(arquivo));
      setErro("");
    }
  };

  const pedirSenha = (acao) => {
    setAcaoSelecionada(acao);
    setShowSenhaModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!nome.trim()) {
      setErro("Por favor, digite o nome do botão");
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
          `botoes/perfil-${perfilId}/${Date.now()}_${imagemSelecionada.name}`,
          imagemSelecionada
        );
      }

      if (audioSelecionado) {
        payload.urlAudio = await uploadArquivo(
          "papagaiando-audios",
          `botoes/perfil-${perfilId}/${Date.now()}_${audioSelecionado.name}`,
          audioSelecionado
        );
      }

      const { data } = await api.put(`/botoes/${botaoId}`, payload, {
        params: { perfilId },
      });

      atualizarFavorito(data);
      alert("Botão atualizado com sucesso!");
      navigate(`/perfil/${perfilId}/categoria/${data.categoriaId}`);
    } catch (error) {
      console.error("Erro ao atualizar botão:", error);
      setErro(mensagemDeErro(error, "Erro ao atualizar botão. Tente novamente."));
    } finally {
      setLoading(false);
    }
  };

  const restaurar = async () => {
    setLoading(true);
    setErro("");

    try {
      const { data } = await api.post(`/botoes/${botaoId}/restaurar`, null, {
        params: { perfilId },
      });

      setBotao(data);
      setNome(data.nome);
      setPreviewImagem(data.urlImagem);
      setAudioUrl(data.urlAudio);
      setImagemSelecionada(null);
      setAudioSelecionado(null);
      atualizarFavorito(data);
      alert("Botão restaurado para o padrão!");
    } catch (error) {
      console.error("Erro ao restaurar botão:", error);
      setErro(mensagemDeErro(error, "Erro ao restaurar botão. Tente novamente."));
    } finally {
      setLoading(false);
    }
  };

  const excluir = async () => {
    setLoading(true);
    setErro("");

    try {
      await api.delete(`/botoes/${botaoId}`);

      removerFavorito(botaoId);
      alert("Botão excluído com sucesso!");
      voltarParaCategoria();
    } catch (error) {
      console.error("Erro ao excluir botão:", error);
      setErro(mensagemDeErro(error, "Erro ao excluir botão. Tente novamente."));
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
              onClick={voltarParaCategoria}
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
            <h1 className="text-3xl font-extrabold">Editar Botão</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-base font-medium mb-2 text-[#004687]">
                Nome do Botão
              </label>
              <input
                type="text"
                placeholder="Ex: Gato, Azul, etc."
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full px-4 py-3 rounded-lg text-[#004687] placeholder-[#004687] focus:outline-none focus:ring-2 focus:ring-white bg-white border border-[#004687] p-2 rounded"
                disabled={loading}
                required
              />
            </div>

            <div>
              <label className="block text-base font-medium mb-2 text-[#004687]">
                Imagem do Botão
              </label>
              <div className="border-2 border-dashed border-[#004687]/50 rounded-lg p-6 text-center cursor-pointer hover:border-white transition">
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

            <div>
              <label className="block text-base font-medium mb-2 text-[#004687]">
                Áudio do Botão
              </label>

              <div className="space-y-4">
                {audioUrl && (
                  <audio key={audioUrl} controls className="w-full">
                    <source src={audioUrl} />
                    Seu navegador não suporta o elemento de áudio.
                  </audio>
                )}

                <div className="text-center">
                  <p className="text-sm text-[#004687]/80 mb-2">Para trocar, faça upload de um novo arquivo de áudio</p>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioChange}
                    className="hidden"
                    id="audio-upload"
                    disabled={loading}
                  />
                  <label
                    htmlFor="audio-upload"
                    className="inline-flex items-center space-x-2 bg-[#004687] hover:bg-[#003366] text-white px-4 py-2 rounded-lg cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Upload de Áudio</span>
                  </label>
                </div>
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

          {botao?.padrao && botao?.personalizado && (
            <button
              onClick={() => pedirSenha("restaurar")}
              disabled={loading}
              className="w-full bg-[#004687] hover:bg-[#003366] transition font-semibold py-3 rounded-lg shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed text-white mt-4"
            >
              Restaurar Padrão
            </button>
          )}

          {botao && !botao.padrao && (
            <button
              onClick={() => pedirSenha("excluir")}
              disabled={loading}
              className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-center font-medium mt-4 rounded-lg"
            >
              Excluir Botão
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
