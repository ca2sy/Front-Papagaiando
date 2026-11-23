import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import HeaderPerfil from "../../components/HeaderPerfil.jsx";
import SenhaModal from "../../components/SenhaModal.jsx";
import BotaoFala from "../../components/BotaoFala.jsx";
import { API_BASE_URL, getApiError } from "../../services/api";

export default function BotoesPage() {
  const [botoes, setBotoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [perfil, setPerfil] = useState(null);
  const [categoria, setCategoria] = useState(null);
  const [showSenhaModal, setShowSenhaModal] = useState(false);
  const [acaoSelecionada, setAcaoSelecionada] = useState(null);
  const [botaoParaEditar, setBotaoParaEditar] = useState(null);
  const [botaoParaExcluir, setBotaoParaExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExclusao, setErroExclusao] = useState("");

  const navigate = useNavigate();
  const { perfilId, categoriaId } = useParams();

  const carregarDados = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token || !perfilId || !categoriaId) {
      setLoading(false);
      return;
    }

    try {
      // Buscar perfil
      const perfilResponse = await fetch(
        `${API_BASE_URL}/perfis/${perfilId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (perfilResponse.ok) {
        const perfilData = await perfilResponse.json();
        setPerfil(perfilData);
      }

      // Buscar botões
      const botoesResponse = await fetch(
        `${API_BASE_URL}/botoes/categoria/${categoriaId}?perfilId=${encodeURIComponent(perfilId)}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (botoesResponse.ok) {
        const todosBotoes = await botoesResponse.json();
        setBotoes(todosBotoes);
      } else {
        const mensagem = await getApiError(
          botoesResponse,
          "Não foi possível carregar os botões."
        );

        console.error("Erro ao buscar botões:", mensagem);
        setBotoes([]);

        if (botoesResponse.status === 401) {
          navigate("/");
        } else {
         alert(mensagem);
        }
      }

      // Buscar categoria
      const categoriasResponse = await fetch(
        `${API_BASE_URL}/categorias/perfil/${perfilId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (categoriasResponse.ok) {
        const todasCategorias =
          await categoriasResponse.json();

        const categoriaEncontrada =
          todasCategorias.find(
            c => c.id === categoriaId
          );

        if (categoriaEncontrada) {
          setCategoria(categoriaEncontrada);
        } else {
          console.error(
            "Categoria não encontrada na lista do perfil"
          );
        }
      } else {
        console.error(
          "Erro ao buscar categorias:",
          categoriasResponse.status
        );
      }

    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setBotoes([]);
    } finally {
      setLoading(false);
    }
  }, [perfilId, categoriaId, navigate]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const restaurarBotao = async (botao) => {
    if (!window.confirm(`Restaurar "${botao.nome}" para o padrão?`)) return;

    const token = localStorage.getItem("token");
    if (!token) return navigate("/");

    try {
      const response = await fetch(
        `${API_BASE_URL}/botoes/${botao.id}/restaurar?perfilId=${encodeURIComponent(perfilId)}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error(await getApiError(response));
      }

      const restaurado = await response.json();

      setBotoes((anteriores) =>
        anteriores.map((item) =>
          item.id === botao.id ? restaurado : item
        )
      );
    } catch (error) {
      alert(error.message || "Erro ao restaurar botão.");
    }
  };

  const handleEditarBotao = (botao) => {
    setBotaoParaEditar(botao);
    setAcaoSelecionada("editar-botao");
    setShowSenhaModal(true);
  };
  
  const excluirBotao = async () => {
    if (!botaoParaExcluir || excluindo) return;

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    setExcluindo(true);
    setErroExclusao("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/botoes/${botaoParaExcluir.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          await getApiError(
            response,
            "Não foi possível excluir o botão."
          )
        );
      }

      setBotoes((anteriores) =>
        anteriores.filter(
          (botao) => botao.id !== botaoParaExcluir.id
        )
      );

      setBotaoParaExcluir(null);
    } catch (error) {
      setErroExclusao(error.message);
    } finally {
      setExcluindo(false);
    }
  };

  const handleMenuClick = (acao) => {
    setAcaoSelecionada(acao);
    setShowSenhaModal(true);
  };

  const handleSenhaConfirmada = () => {
    setShowSenhaModal(false);

    switch (acaoSelecionada) {
      case "editar-perfil":
        navigate(`/editar-perfil/${perfilId}`);
        break;

      case "criar-botao":
        navigate(`/criar-botao/${perfilId}`, {
          state: {
            categoriaId: categoriaId
          }
        });
        break;

      case "criar-categoria":
        navigate(`/criar-categoria/${perfilId}`);
        break;

      case "sair":
        navigate("/meus-perfis");
        break;

      case "editar-botao":
        if (botaoParaEditar) {
          navigate(
            `/perfil/${perfilId}/categoria/${categoriaId}/botao/${botaoParaEditar.id}/editar`
          );
        }
        break;

      case "excluir-botao":
        excluirBotao();
        break;

      default:
        break;
    }
  };

  const handleBotaoClick = (botao) => {
    if (botao.urlAudio) {
      const audio = new Audio(botao.urlAudio);

      audio.play().catch(error => {
        console.error(
          "Erro ao reproduzir áudio:",
          error
        );

        alert(
          "Não foi possível reproduzir o áudio"
        );
      });
    }
  };

  const handleVoltar = () => {
    navigate(`/perfil/${perfilId}/categorias`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#b3daff] flex items-center justify-center">
        <p className="text-xl text-blue-900">
          Carregando botões...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#b3daff]">
      <HeaderPerfil
        perfil={perfil}
        onMenuClick={handleMenuClick}
      />

      <div className="p-4 sm:p-6 max-w-7xl mx-auto">

        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-6">

          <button
            onClick={handleVoltar}
            className="flex items-center text-blue-900 hover:text-[#004687] font-medium"
          >
            <svg
              className="w-5 h-5 mr-2"
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

            Voltar
          </button>

          {categoria && (
            <div className="text-center flex-1">
              <h1 className="text-2xl font-bold text-blue-900">
                {categoria.nome}
              </h1>
            </div>
          )}

          <button
            onClick={() =>
              handleMenuClick("criar-botao")
            }
            className="bg-[#004687] hover:bg-[#003D99] text-white px-4 py-2 rounded-lg font-medium"
          >
            + Botão
          </button>
        </div>

        {/* Grid de botões */}
        {botoes.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">

            {botoes.map((botao) => (
              <div key={botao.id} className="relative">
                <BotaoFala
                  botao={botao}
                  perfilId={perfilId}
                  onClick={handleBotaoClick}
                />

                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleEditarBotao(botao)}
                    className="flex-1 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[#004687] shadow-sm hover:bg-blue-50"
                    aria-label={`Editar botão ${botao.nome}`}
                  >
                    Editar
                  </button>

                  {!botao.padrao && (
                    <button
                      type="button"
                      onClick={() => {
                        setErroExclusao("");
                        setBotaoParaExcluir(botao);
                      }}
                      className="flex-1 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-red-600 shadow-sm hover:bg-red-50"
                      aria-label={`Excluir botão ${botao.nome}`}
                    >
                      Excluir
                    </button>
                  )}

                  {botao.padrao && botao.personalizado && (
                    <button
                      type="button"
                      onClick={() => restaurarBotao(botao)}
                      className="flex-1 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[#004687]"
                    >
                      Restaurar
                      </button>
                  )}
                </div>
              </div>
            ))}

          </div>
        ) : (
          <div className="text-center mt-12">

            <p className="text-blue-900 text-lg mb-4">
              Nenhum botão encontrado nesta categoria.
            </p>

            <button
              onClick={() =>
                handleMenuClick("criar-botao")
              }
              className="bg-blue-600 hover:bg-[#004687] text-white px-6 py-2 rounded-lg font-medium"
            >
              Criar Primeiro Botão
            </button>

          </div>
        )}
      </div>

        {botaoParaExcluir && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="titulo-excluir-botao"
              aria-describedby="descricao-excluir-botao"
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            >
              <h2
                id="titulo-excluir-botao"
                className="mb-3 text-xl font-bold text-[#004687]"
              >
                Excluir botão?
              </h2>

              <p
                id="descricao-excluir-botao"
                className="mb-4 text-gray-700"
              >
                Deseja realmente excluir o botão{" "}
                <strong>{botaoParaExcluir.nome}</strong>?
                Esta ação não poderá ser desfeita.
              </p>

              {erroExclusao && (
                <p role="alert" className="mb-4 text-sm text-red-600">
                  {erroExclusao}
                </p>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  disabled={excluindo}
                  onClick={() => {
                    setBotaoParaExcluir(null);
                    setErroExclusao("");
                  }}
                  className="rounded-lg border border-[#004687] px-4 py-2 text-[#004687]"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  disabled={excluindo}
                  onClick={() => {
                    setAcaoSelecionada("excluir-botao");
                    setShowSenhaModal(true);
                  }}
                  className="rounded-lg bg-red-600 px-4 py-2 text-white disabled:opacity-50"
                >
                  {excluindo ? "Excluindo..." : "Excluir"}
                </button>
              </div>
            </div>
          </div>
        )}

        {erroExclusao && !botaoParaExcluir && (
          <div role="alert" className="mx-auto max-w-xl p-4 text-red-700">
            {erroExclusao}
          </div>
        )}

      <SenhaModal
        isOpen={showSenhaModal}
        onClose={() =>
          setShowSenhaModal(false)
        }
        onConfirm={handleSenhaConfirmada}
        titulo="Confirmar ação"
        mensagem="Por favor, digite sua senha para continuar:"
      />
    </div>
  );
}