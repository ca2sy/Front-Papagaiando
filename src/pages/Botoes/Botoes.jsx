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
  useEffect(() => {
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
}, [perfilId, categoriaId]);
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
    <div className="min-h-screen bg-[#F8F5F3]">
      <HeaderPerfil
        perfil={perfil}
        onMenuClick={handleMenuClick}
        itemEdicao="Editar botões"
      />

      <main className="mx-auto w-full max-w-6xl px-5 pb-12 pt-8 sm:px-8 sm:pt-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleVoltar}
            className="text-sm font-semibold text-[#365FB3] hover:underline"
          >
            ‹ Categorias
          </button>

          <button
            type="button"
            onClick={() => handleMenuClick("criar-botao")}
            className="inline-flex items-center gap-2 rounded-xl bg-[#365FB3] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1F3F80]"
          >
            <FiPlus size={18} aria-hidden="true" />
            Novo botão
          </button>
        </div>

        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-[#1F3F80] sm:text-4xl">
            {categoria?.nome || "Botões"}
          </h1>

          <p className="text-base text-[#617A98]">
            {editando
              ? "Escolha o botão que deseja editar."
              : "Toque na imagem para falar."}
          </p>
        </div>

        {editando && (
          <div className="mb-8">
            <BarraEdicao
              texto="Toque no botão que quer editar."
              onConcluir={() => setEditando(false)}
            />
          </div>
        )}

        {botoes.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:gap-x-7 lg:gap-y-10">
            {botoes.map((botao) => (
              <div key={botao.id} className="relative min-w-0">
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
          <div className="rounded-3xl bg-[#CFE5F5] px-6 py-14 text-center">
            <h2 className="mb-3 text-xl font-bold text-[#1F3F80]">
              Ainda não há botões nesta categoria
            </h2>

            <p className="mb-6 text-[#617A98]">
              Adicione um botão para começar a se comunicar.
            </p>

            <button
              type="button"
              onClick={() => handleMenuClick("criar-botao")}
              className="rounded-xl bg-[#365FB3] px-6 py-3 font-semibold text-white transition hover:bg-[#1F3F80]"
            >
              Criar primeiro botão
            </button>
          </div>
        )}
      </main>

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
