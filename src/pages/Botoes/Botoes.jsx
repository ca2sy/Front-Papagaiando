import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import HeaderPerfil from "../../components/HeaderPerfil.jsx";
import SenhaModal from "../../components/SenhaModal.jsx";
import BotaoFala from "../../components/BotaoFala.jsx";
import { API_BASE_URL, getApiError } from "../../services/api";

import { aviso } from "../../components/Aviso";
import TituloSecao from "../../components/TituloSecao";
import { FiPlus } from "react-icons/fi";
import { lerCache, salvarCache } from "../../services/cache";
import BotaoVoltar from "../../components/BotaoVoltar";
import TelaCarregando from "../../components/Carregando";
import ConfirmModal from "../../components/ConfirmModal";
import { confirmar } from "../../components/confirmar";
import { useModoEdicao } from "../../services/navegacao";
import {
  atualizarFavorito,
  removerFavorito,
  sincronizarFavoritosDaCategoria,
} from "../../services/favoritos";
import {
  BarraEdicao,
  AcaoExcluir,
  AcaoRestaurar,
} from "../../components/ModoEdicao";

export default function BotoesPage() {
  const { perfilId, categoriaId } = useParams();
  const chaveBotoes = `botoes:${perfilId}:${categoriaId}`;
  const chavePerfil = `perfil:${perfilId}`;

  // Mostra na hora o que já estava salvo e atualiza em segundo plano
  const [botoes, setBotoes] = useState(() => lerCache(chaveBotoes) || []);
  const [loading, setLoading] = useState(() => !lerCache(chaveBotoes));
  const [perfil, setPerfil] = useState(() => lerCache(chavePerfil));
  const [categoria, setCategoria] = useState(
    () =>
      (lerCache(`categorias:${perfilId}`) || []).find(
        (c) => c.id === categoriaId,
      ) || null,
  );
  const [showSenhaModal, setShowSenhaModal] = useState(false);
  const [acaoSelecionada, setAcaoSelecionada] = useState(null);
  const [botaoParaExcluir, setBotaoParaExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExclusao, setErroExclusao] = useState("");

  const navigate = useNavigate();
  const [editando, setEditando] = useModoEdicao();

  const carregarDados = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token || !perfilId || !categoriaId) {
      setLoading(false);
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    try {
      // Perfil, botões e categorias são buscados ao mesmo tempo
      const [perfilResponse, botoesResponse, categoriasResponse] =
        await Promise.all([
          fetch(`${API_BASE_URL}/perfis/${perfilId}`, { headers }),
          fetch(
            `${API_BASE_URL}/botoes/categoria/${categoriaId}?perfilId=${encodeURIComponent(perfilId)}`,
            { headers },
          ),
          fetch(`${API_BASE_URL}/categorias/perfil/${perfilId}`, { headers }),
        ]);

      if (perfilResponse.ok) {
        const perfilData = await perfilResponse.json();
        setPerfil(perfilData);
        salvarCache(chavePerfil, perfilData);
      }

      if (botoesResponse.ok) {
        const todosBotoes = await botoesResponse.json();
        setBotoes(todosBotoes);
        sincronizarFavoritosDaCategoria(perfilId, categoriaId, todosBotoes);
      } else {
        const mensagem = await getApiError(
          botoesResponse,
          "Não foi possível carregar os botões.",
        );

        console.error("Erro ao buscar botões:", mensagem);

        if (botoesResponse.status === 401) {
          navigate("/", { replace: true });
        } else {
          aviso(mensagem, "erro");
        }
      }

      if (categoriasResponse.ok) {
        const todasCategorias = await categoriasResponse.json();
        salvarCache(`categorias:${perfilId}`, todasCategorias);

        const categoriaEncontrada = todasCategorias.find(
          (c) => c.id === categoriaId,
        );

        if (categoriaEncontrada) {
          setCategoria(categoriaEncontrada);
        } else {
          console.error("Categoria não encontrada na lista do perfil");
        }
      } else {
        console.error("Erro ao buscar categorias:", categoriasResponse.status);
      }
    } catch (error) {
      // Sem conexão: continua mostrando o que estava no cache
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  }, [perfilId, categoriaId, navigate, chavePerfil]);

  // Mantém o cache igual ao que está na tela (inclui excluir/restaurar)
  useEffect(() => {
    if (!loading) salvarCache(chaveBotoes, botoes);
  }, [botoes, loading, chaveBotoes]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const restaurarBotao = async (botao) => {
    const ok = await confirmar({
      titulo: "Restaurar botão?",
      mensagem: (
        <>
          O botão <strong>{botao.nome}</strong> vai voltar a ser como era
          originalmente. As alterações feitas nele serão perdidas.
        </>
      ),
      textoConfirmar: "Restaurar",
    });
    if (!ok) return;

    const token = localStorage.getItem("token");
    if (!token) return navigate("/", { replace: true });

    try {
      const response = await fetch(
        `${API_BASE_URL}/botoes/${botao.id}/restaurar?perfilId=${encodeURIComponent(perfilId)}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) {
        throw new Error(await getApiError(response));
      }

      const restaurado = await response.json();
      atualizarFavorito(perfilId, botao.id, restaurado);

      setBotoes((anteriores) =>
        anteriores.map((item) => (item.id === botao.id ? restaurado : item)),
      );
    } catch (error) {
      aviso(error.message || "Erro ao restaurar botão.", "erro");
    }
  };

  const excluirBotao = async () => {
    if (!botaoParaExcluir || excluindo) return;

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/", { replace: true });
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
        },
      );

      if (!response.ok) {
        throw new Error(
          await getApiError(response, "Não foi possível excluir o botão."),
        );
      }

      setBotoes((anteriores) =>
        anteriores.filter((botao) => botao.id !== botaoParaExcluir.id),
      );
      removerFavorito(perfilId, botaoParaExcluir.id);

      setBotaoParaExcluir(null);
    } catch (error) {
      setErroExclusao(error.message);
    } finally {
      setExcluindo(false);
    }
  };

  const irParaCriarBotao = () => {
    navigate(`/criar-botao/${perfilId}`, { state: { categoriaId } });
  };

  const handleMenuClick = (acao) => {
    // No modo edição a senha já foi confirmada
    if (editando && acao === "criar-botao") {
      irParaCriarBotao();
      return;
    }
    setAcaoSelecionada(acao);
    setShowSenhaModal(true);
  };

  const handleSenhaConfirmada = () => {
    setShowSenhaModal(false);

    switch (acaoSelecionada) {
      case "modo-edicao":
        setEditando(true);
        break;

      case "editar-perfil":
        navigate(`/editar-perfil/${perfilId}`);
        break;

      case "criar-botao":
        irParaCriarBotao();
        break;

      case "criar-categoria":
        navigate(`/criar-categoria/${perfilId}`);
        break;

      case "sair":
        navigate("/meus-perfis");
        break;

      default:
        break;
    }
  };

  const handleBotaoClick = (botao) => {
    if (editando) {
      navigate(
        `/perfil/${perfilId}/categoria/${categoriaId}/botao/${botao.id}/editar`,
      );
      return;
    }

    if (botao.urlAudio) {
      const audio = new Audio(botao.urlAudio);

      audio.play().catch((error) => {
        console.error("Erro ao reproduzir áudio:", error);

        aviso("Não foi possível reproduzir o áudio", "erro");
      });
    }
  };

  const handleVoltar = () => {
    navigate(`/perfil/${perfilId}/categorias`);
  };

  if (loading) {
    return <TelaCarregando texto="Carregando botões..." />;
  }

  return (
    <div className="min-h-screen bg-[#b3daff]">
      <HeaderPerfil
        perfil={perfil}
        onMenuClick={handleMenuClick}
        itemEdicao="Editar botões"
      />

      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        {editando && (
          <BarraEdicao
            texto="Toque no botão que quer editar."
            onConcluir={() => setEditando(false)}
          />
        )}

        {/* Cabeçalho */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <BotaoVoltar onClick={handleVoltar} texto="Categorias" />

          <button
            onClick={() => handleMenuClick("criar-botao")}
            className="inline-flex items-center gap-2 rounded-full bg-[#004687] px-4 py-2 font-semibold text-white shadow-md hover:bg-[#003366] transition"
          >
            <FiPlus size={20} aria-hidden="true" />
            Novo botão
          </button>
        </div>

        <TituloSecao
          como="h1"
          titulo={categoria?.nome || "Botões"}
          subtitulo={
            editando
              ? "Escolha o botão que você quer alterar"
              : "Toque em um botão para ouvir"
          }
        />

        {/* Grid de botões */}
        {botoes.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {botoes.map((botao) => (
              <div key={botao.id} className="relative">
                <BotaoFala
                  botao={botao}
                  perfilId={perfilId}
                  onClick={handleBotaoClick}
                  categoriaId={categoriaId}
                  modoEdicao={editando}
                />

                {editando && botao.padrao && botao.personalizado && (
                  <AcaoRestaurar
                    nome={botao.nome}
                    onClick={() => restaurarBotao(botao)}
                  />
                )}

                {editando && !botao.padrao && (
                  <AcaoExcluir
                    nome={botao.nome}
                    onClick={() => {
                      setErroExclusao("");
                      setBotaoParaExcluir(botao);
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center mt-12">
            <p className="text-blue-900 text-lg mb-4">
              Nenhum botão encontrado nesta categoria.
            </p>

            <button
              onClick={() => handleMenuClick("criar-botao")}
              className="bg-blue-600 hover:bg-[#004687] text-white px-6 py-2 rounded-lg font-medium"
            >
              Criar Primeiro Botão
            </button>
          </div>
        )}
      </div>

      <ConfirmModal
        aberto={!!botaoParaExcluir}
        titulo="Excluir botão?"
        mensagem={
          <>
            O botão <strong>{botaoParaExcluir?.nome}</strong> será apagado para
            sempre. Essa ação não pode ser desfeita.
          </>
        }
        textoConfirmar={excluindo ? "Excluindo..." : "Sim, excluir"}
        perigo
        carregando={excluindo}
        erro={erroExclusao}
        onConfirmar={excluirBotao}
        onCancelar={() => {
          setBotaoParaExcluir(null);
          setErroExclusao("");
        }}
      />

      {erroExclusao && !botaoParaExcluir && (
        <div role="alert" className="mx-auto max-w-xl p-4 text-red-700">
          {erroExclusao}
        </div>
      )}

      <SenhaModal
        isOpen={showSenhaModal}
        onClose={() => setShowSenhaModal(false)}
        onConfirm={handleSenhaConfirmada}
        titulo="Área do responsável"
        mensagem="Para continuar, digite a senha da sua conta."
      />
    </div>
  );
}
