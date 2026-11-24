import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import HeaderPerfil from "../../components/HeaderPerfil.jsx";
import SenhaModal from "../../components/SenhaModal.jsx";
import BotaoFala from "../../components/BotaoFala.jsx";
import { API_BASE_URL, getApiError } from "../../services/api";
import { aviso } from "../../components/Aviso";
import TituloSecao from "../../components/TituloSecao";
import { lerCache, salvarCache } from "../../services/cache";
import TelaCarregando from "../../components/Carregando";
import ConfirmModal from "../../components/ConfirmModal";
import { confirmar } from "../../components/confirmar";
import { useModoEdicao } from "../../services/navegacao";
import {
  lerFavoritos,
  ouvirFavoritos,
  sincronizarFavoritosDasCategorias,
} from "../../services/favoritos";
import {
  BarraEdicao,
  SeloEditar,
  AcaoExcluir,
  AcaoRestaurar,
} from "../../components/ModoEdicao";

export default function CategoriasPage() {
  const { perfilId } = useParams();
  const chaveCategorias = `categorias:${perfilId}`;
  const chavePerfil = `perfil:${perfilId}`;

  // Mostra na hora o que já estava salvo e atualiza em segundo plano
  const [categorias, setCategorias] = useState(
    () => lerCache(chaveCategorias) || [],
  );
  const [favoritos, setFavoritos] = useState(() => lerFavoritos(perfilId));
  const [loading, setLoading] = useState(() => !lerCache(chaveCategorias));
  const [perfil, setPerfil] = useState(() => lerCache(chavePerfil));
  const [showSenhaModal, setShowSenhaModal] = useState(false);
  const [acaoSelecionada, setAcaoSelecionada] = useState(null);
  const [categoriaParaExcluir, setCategoriaParaExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExclusao, setErroExclusao] = useState("");
  const [pagina, setPagina] = useState(1);
  const carrosselRef = useRef(null);
  const categoriasPorPagina = 8;

  const moverCarrossel = (direcao) => {
    if (!carrosselRef.current) return;

    carrosselRef.current.scrollBy({
      left: carrosselRef.current.clientWidth * direcao,
      behavior: "smooth",
    });
  };

  const totalPaginas = Math.max(
    1,
    Math.ceil(categorias.length / categoriasPorPagina),
  );

  const paginaAtual = Math.min(pagina, totalPaginas);

  const categoriasVisiveis = categorias.slice(
    (paginaAtual - 1) * categoriasPorPagina,
    paginaAtual * categoriasPorPagina,
  );

  const navigate = useNavigate();
  const [editando, setEditando] = useModoEdicao();

  const carregarCategorias = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token || !perfilId) {
      setLoading(false);
      navigate(!token ? "/" : "/meus-perfis", { replace: true });
      return;
    }

    const headers = { Authorization: "Bearer " + token };

    try {
      // Perfil e categorias são buscados ao mesmo tempo
      const [perfilResponse, categoriasResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/perfis/${perfilId}`, { headers }),
        fetch(`${API_BASE_URL}/categorias/perfil/${perfilId}`, { headers }),
      ]);

      if (perfilResponse.ok) {
        const perfilData = await perfilResponse.json();
        setPerfil(perfilData);
        salvarCache(chavePerfil, perfilData);
      }

      if (categoriasResponse.ok) {
        const data = await categoriasResponse.json();

        const categoriasComFlag = data.map((c) => ({
          ...c,
          isPadrao: c.padrao,
        }));

        setCategorias(categoriasComFlag);
        sincronizarFavoritosDasCategorias(perfilId, categoriasComFlag);
      } else {
        const mensagem = await getApiError(
          categoriasResponse,
          "Não foi possível carregar as categorias.",
        );

        console.error("Erro ao buscar categorias:", mensagem);

        if (categoriasResponse.status === 401) {
          navigate("/", { replace: true });
        } else {
          aviso(mensagem, "erro");
        }
      }
    } catch (error) {
      // Sem conexão: continua mostrando o que estava no cache
      console.error("Erro ao carregar categorias:", error);
    } finally {
      setLoading(false);
    }
  }, [perfilId, navigate, chavePerfil]);

  // Mantém o cache igual ao que está na tela (inclui excluir/restaurar)
  useEffect(() => {
    if (!loading) salvarCache(chaveCategorias, categorias);
  }, [categorias, loading, chaveCategorias]);

  useEffect(() => {
    carregarCategorias();
  }, [carregarCategorias]);

  useEffect(() => {
    const atualizarFavoritos = () => setFavoritos(lerFavoritos(perfilId));
    atualizarFavoritos();
    return ouvirFavoritos(atualizarFavoritos);
  }, [perfilId]);

  const handleMenuClick = (acao) => {
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
        navigate(`/criar-botao/${perfilId}`);
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

  const restaurarCategoria = async (categoria) => {
    const ok = await confirmar({
      titulo: "Restaurar categoria?",
      mensagem: (
        <>
          A categoria <strong>{categoria.nome}</strong> vai voltar a ser como
          era originalmente. As alterações feitas nela serão perdidas.
        </>
      ),
      textoConfirmar: "Restaurar",
    });
    if (!ok) return;

    const token = localStorage.getItem("token");
    if (!token) return navigate("/", { replace: true });

    try {
      const response = await fetch(
        `${API_BASE_URL}/categorias/${categoria.id}/restaurar?perfilId=${encodeURIComponent(perfilId)}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) {
        throw new Error(await getApiError(response));
      }

      const restaurada = await response.json();

      setCategorias((anteriores) =>
        anteriores.map((item) =>
          item.id === categoria.id ? restaurada : item,
        ),
      );
    } catch (error) {
      aviso(error.message || "Erro ao restaurar categoria.", "erro");
    }
  };

  const reproduzirFavorito = (botao) => {
    if (!botao.urlAudio) return;

    const audio = new Audio(botao.urlAudio);

    audio.play().catch(() => {
      aviso("Não foi possível reproduzir o áudio.", "erro");
    });
  };

  const handleCategoriaClick = (categoria) => {
    if (editando) {
      navigate(`/perfil/${perfilId}/categoria/${categoria.id}/editar`);
    } else {
      navigate(`/perfil/${perfilId}/categoria/${categoria.id}`);
    }
  };

  const excluirCategoria = async () => {
    if (!categoriaParaExcluir || excluindo) return;

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/", { replace: true });
      return;
    }

    setExcluindo(true);
    setErroExclusao("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/categorias/${categoriaParaExcluir.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const mensagem = await getApiError(
          response,
          "Não foi possível excluir a categoria.",
        );

        throw new Error(mensagem);
      }

      setCategorias((anteriores) => {
        const restantes = anteriores.filter(
          (categoria) => categoria.id !== categoriaParaExcluir.id,
        );
        sincronizarFavoritosDasCategorias(perfilId, restantes);
        return restantes;
      });

      setCategoriaParaExcluir(null);
    } catch (error) {
      setErroExclusao(error.message);
    } finally {
      setExcluindo(false);
    }
  };

  if (loading) {
    return <TelaCarregando texto="Carregando categorias..." />;
  }

  return (
    <div className="min-h-screen bg-[#F8F5F3]">
      <HeaderPerfil
        perfil={perfil}
        onMenuClick={handleMenuClick}
        itemEdicao="Editar categorias"
      />

      <main className="mx-auto w-full max-w-6xl px-5 pb-16 pt-8 font-['Poppins'] sm:px-8 sm:pt-10">
        <button
          type="button"
          onClick={() => navigate("/meus-perfis")}
          className="mb-5 text-sm font-semibold text-[#365FB3] hover:underline"
        >
          ‹ Trocar perfil
        </button>

        <h1 className="mb-7 text-3xl font-bold text-[#1F3F80] sm:text-4xl">
          Comunicação
        </h1>

        {editando && (
          <BarraEdicao
            texto="Toque na categoria que deseja editar."
            onConcluir={() => setEditando(false)}
          />
        )}

        {!editando && favoritos.length > 0 && (
          <section
            aria-labelledby="titulo-favoritos"
            className="mb-10 rounded-3xl bg-[#CFE5F5] p-5 sm:p-6"
          >
            <h2
              id="titulo-favoritos"
              className="mb-5 text-xl font-bold text-[#1F3F80]"
            >
              Botões favoritos
            </h2>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => moverCarrossel(-1)}
                aria-label="Ver favoritos anteriores"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-2xl font-semibold text-[#365FB3] shadow-sm transition hover:bg-[#EAF1FF]"
              >
                ‹
              </button>

              <div
                ref={carrosselRef}
                className="flex min-w-0 flex-1 snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth"
                style={{ scrollbarWidth: "none" }}
              >
                {favoritos.map((botao) => (
                  <div
                    key={botao.id}
                    className="min-w-0 shrink-0 basis-[calc((100%-1rem)/2)] snap-start sm:basis-[calc((100%-2rem)/3)] lg:basis-[calc((100%-3rem)/4)]"
                  >
                    <BotaoFala
                      botao={botao}
                      perfilId={perfilId}
                      onClick={reproduzirFavorito}
                    />
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => moverCarrossel(1)}
                aria-label="Ver próximos favoritos"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-2xl font-semibold text-[#365FB3] shadow-sm transition hover:bg-[#EAF1FF]"
              >
                ›
              </button>
            </div>
          </section>
        )}

        <section aria-labelledby="titulo-categorias">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h2
              id="titulo-categorias"
              className="text-2xl font-bold text-[#1F3F80]"
            >
              Categorias
            </h2>

            {totalPaginas > 1 && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-[#1F3F80]">
                  Página {paginaAtual} de {totalPaginas}
                </span>

                <button
                  type="button"
                  disabled={paginaAtual === 1}
                  onClick={() => setPagina(paginaAtual - 1)}
                  className="rounded-xl border border-[#365FB3]/40 bg-white px-4 py-2 text-sm font-semibold text-[#365FB3] disabled:opacity-40"
                >
                  Anterior
                </button>

                <button
                  type="button"
                  disabled={paginaAtual === totalPaginas}
                  onClick={() => setPagina(paginaAtual + 1)}
                  className="rounded-xl bg-[#365FB3] px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
                >
                  Próxima ›
                </button>
              </div>
            )}
          </div>

          {categorias.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-7">
              {categoriasVisiveis.map((categoria) => (
                <div key={categoria.id} className="relative">
                  <CategoriaCard
                    categoria={categoria}
                    onClick={handleCategoriaClick}
                    editando={editando}
                  />

                  {editando && categoria.padrao && categoria.personalizado && (
                    <AcaoRestaurar
                      nome={categoria.nome}
                      onClick={() => restaurarCategoria(categoria)}
                    />
                  )}

                  {editando && !categoria.padrao && (
                    <AcaoExcluir
                      nome={categoria.nome}
                      onClick={() => {
                        setErroExclusao("");
                        setCategoriaParaExcluir(categoria);
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="py-12 text-center text-[#1F3F80]">
              Nenhuma categoria encontrada.
            </p>
          )}
        </section>
      </main>

      <ConfirmModal
        aberto={!!categoriaParaExcluir}
        titulo="Excluir categoria?"
        mensagem={
          <>
            A categoria <strong>{categoriaParaExcluir?.nome}</strong> será
            apagada para sempre. Essa ação não pode ser desfeita.
          </>
        }
        textoConfirmar={excluindo ? "Excluindo..." : "Sim, excluir"}
        perigo
        carregando={excluindo}
        erro={erroExclusao}
        onConfirmar={excluirCategoria}
        onCancelar={() => {
          setCategoriaParaExcluir(null);
          setErroExclusao("");
        }}
      />

      {/* Depois do ConfirmModal para ficar por cima dele */}
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

function CategoriaCard({ categoria, onClick, editando }) {
  return (
    <button
      type="button"
      onClick={() => onClick(categoria)}
      aria-label={
        editando ? `Editar categoria ${categoria.nome}` : categoria.nome
      }
      className="group flex w-full flex-col items-center gap-3 text-center"
    >
      <div className="relative flex aspect-[5/3] w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-[#365FB3]/25 bg-white p-4 transition hover:border-[#365FB3] hover:shadow-md">
        <img
          src={categoria.urlImagem}
          alt=""
          className="h-full w-full object-contain"
        />

        {editando && <SeloEditar />}
      </div>

      <span className="text-sm font-semibold text-[#1F3F80] sm:text-base">
        {categoria.nome}
      </span>
    </button>
  );
}
