import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import papagaiandoImg from "../../assets/papagaiando.jpg";
import { API_BASE_URL, getApiError } from "../../services/api";
import { aviso } from "../../components/Aviso";
import TelaCarregando from "../../components/Carregando";
import ConfirmModal from "../../components/ConfirmModal";
import {
  FiUser,
  FiLogOut,
  FiPlus,
  FiSettings,
  FiCheck,
  FiEdit2,
  FiTrash2,
} from "react-icons/fi";
import { lerCache, salvarCache } from "../../services/cache";
import { sairDaConta } from "../../services/auth";
import { apagarFavoritosDoPerfil } from "../../services/favoritos";

const LIMITE_PERFIS = 3;

// A API pode devolver a lista direto ou dentro de um objeto.
function paraLista(dados) {
  if (Array.isArray(dados)) return dados;
  const lista = dados?.perfis ?? dados?.content ?? dados?.data ?? dados?.items;
  return Array.isArray(lista) ? lista : [];
}

export default function MeusPerfis() {
  // Mostra na hora os perfis já salvos e atualiza em segundo plano
  const [perfis, setPerfis] = useState(() => paraLista(lerCache("perfis")));
  const [loading, setLoading] = useState(
    () => !Array.isArray(lerCache("perfis")),
  );
  const [perfilParaExcluir, setPerfilParaExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExclusao, setErroExclusao] = useState("");
  const [gerenciando, setGerenciando] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPerfis = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        navigate("/", { replace: true });
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/perfis/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setPerfis(paraLista(data));
        } else {
          const mensagem = await getApiError(
            response,
            "Não foi possível carregar os perfis.",
          );

          console.error("Erro ao buscar perfis:", mensagem);
          aviso(mensagem, "erro");

          if (response.status === 401) {
            sairDaConta();
            navigate("/", { replace: true });
          }
        }
      } catch (error) {
        console.error("Erro de conexão:", error);
        aviso("Erro de conexão com o servidor.", "erro");
      } finally {
        setLoading(false);
      }
    };

    fetchPerfis();
  }, [navigate]);

  useEffect(() => {
    if (!loading) salvarCache("perfis", perfis);
  }, [perfis, loading]);

  const excluirPerfil = async () => {
    if (!perfilParaExcluir || excluindo) return;

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/", { replace: true });
      return;
    }

    setExcluindo(true);
    setErroExclusao("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/perfis/${perfilParaExcluir.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(
          await getApiError(response, "Não foi possível excluir o perfil."),
        );
      }

      setPerfis((anteriores) =>
        anteriores.filter((perfil) => perfil.id !== perfilParaExcluir.id),
      );
      apagarFavoritosDoPerfil(perfilParaExcluir.id);
      if (perfis.length <= 1) setGerenciando(false);

      setPerfilParaExcluir(null);
    } catch (error) {
      setErroExclusao(error.message || "Não foi possível excluir o perfil.");
    } finally {
      setExcluindo(false);
    }
  };

  if (loading) {
    return <TelaCarregando texto="Carregando perfis..." />;
  }

  const podeAdicionar = perfis.length < LIMITE_PERFIS;

  const pedirExclusao = (perfil) => {
    setErroExclusao("");
    setPerfilParaExcluir(perfil);
  };

  const abrirPerfil = (perfil) => {
    if (gerenciando) {
      navigate(`/editar-perfil/${perfil.id}`);
    } else {
      navigate(`/perfil/${perfil.id}/categorias`);
    }
  };

  let subtitulo = "Escolha um perfil para começar.";
  if (gerenciando) {
    subtitulo = "Toque em um perfil para editar ou na lixeira para excluir.";
  } else if (perfis.length === 0) {
    subtitulo = "Crie o primeiro perfil para começar.";
  }

  return (
    <div className="min-h-screen bg-[#f8f5f3] font-['Poppins'] text-[#1f3f80]">
      {/* Cabeçalho */}
      <header className="bg-[#365FB3] shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <img
              src={papagaiandoImg}
              alt=""
              className="h-11 w-11 rounded-xl object-cover"
            />
            <span className="fonte-marca text-xl font-bold text-white sm:text-2xl">
              Papagaiando
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <span className="hidden text-sm font-medium text-white sm:block">
              Perfis
            </span>
            <button
              type="button"
              onClick={() => {
                sairDaConta();
                navigate("/", { replace: true });
              }}
              className="rounded-lg p-2 text-white hover:bg-white/15"
              aria-label="Sair da conta"
              title="Sair da conta"
            >
              <FiLogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100dvh-64px)] w-full max-w-6xl flex-col px-5 pb-8 pt-8 sm:px-8">
        {/* Voltar para a conta */}
        <button
          type="button"
          onClick={() => navigate("/minha-conta")}
          className="mb-7 mt-7 self-start text-sm font-semibold text-[#2a5bbd] hover:underline"
        >
          ‹ Minha conta
        </button>

        {/* Título */}
        <div className="mb-2 mt-auto">
          <h1 className="mb-2 text-3xl font-bold text-[#1f3f80] sm:text-4xl">
            {gerenciando ? "Gerenciar perfis" : "Quem vai se comunicar?"}
          </h1>
          <p className="text-sm text-[#607b92] sm:text-base">
            {gerenciando
              ? "Selecione um perfil para editar ou excluir."
              : perfis.length === 0
                ? "Crie o primeiro perfil para começar."
                : "Escolha um perfil para abrir seus favoritos e categorias."}
          </p>
        </div>

        {/* Cartões de perfis */}
        <ul className="mb-auto grid w-full grid-cols-1 justify-center gap-5 py-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
          {perfis.map((perfil) => (
            <li
              key={perfil.id}
              className="flex min-h-64 lg:min-h-[clamp(16rem,38dvh,22rem)] flex-col items-center justify-between rounded-3xl border-2 border-[#365FB3]/15 bg-white px-5 py-7 transition hover:border-[#365FB3] hover:shadow-md"
            >
              <button
                type="button"
                onClick={() => abrirPerfil(perfil)}
                className="flex w-full flex-1 flex-col items-center justify-center gap-4 rounded-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-[#365FB3]/25"
                aria-label={
                  gerenciando
                    ? `Editar perfil ${perfil.nome}`
                    : `Entrar no perfil ${perfil.nome}`
                }
              >
                <Avatar perfil={perfil} />

                <span className="max-w-full truncate text-center text-xl font-semibold text-[#1f3f80]">
                  {perfil.nome}
                </span>
              </button>

              <div className="mt-4 flex items-center justify-center gap-5">
                <button
                  type="button"
                  onClick={() => navigate(`/editar-perfil/${perfil.id}`)}
                  className="text-sm font-semibold text-[#365FB3] hover:underline"
                >
                  Editar perfil
                </button>

                {gerenciando && (
                  <button
                    type="button"
                    onClick={() => pedirExclusao(perfil)}
                    className="flex items-center gap-1 text-sm font-semibold text-red-600 hover:underline"
                    aria-label={`Excluir perfil ${perfil.nome}`}
                  >
                    <FiTrash2 size={16} />
                    Excluir
                  </button>
                )}
              </div>
            </li>
          ))}

          {/* Criar novo perfil */}
          {podeAdicionar && !gerenciando && (
            <li>
              <button
                type="button"
                onClick={() => navigate("/criar-perfil")}
                className="flex min-h-64 lg:min-h-[clamp(16rem,38dvh,22rem)] w-full flex-col items-center justify-center gap-8 rounded-3xl border border-[#9dc3dd] bg-[#cfe5f5] px-5 py-7 text-[#365FB3] transition hover:border-[#365FB3] hover:bg-[#bedef3] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#365FB3]/25"
              >
                <FiPlus size={52} strokeWidth={1.8} aria-hidden="true" />
                <span className="text-xl font-semibold">Criar perfil</span>
              </button>
            </li>
          )}
        </ul>

        {/* Gerenciamento dos perfis */}
        {perfis.length > 0 && (
          <div className="mt-12 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-[#607b92]">
              {perfis.length} de {LIMITE_PERFIS} perfis
            </p>

            <button
              type="button"
              onClick={() => setGerenciando((atual) => !atual)}
              className="inline-flex items-center gap-2 rounded-xl border border-[#365FB3]/30 bg-white px-4 py-2 text-sm font-semibold text-[#365FB3] transition hover:bg-[#e2effa]"
            >
              {gerenciando ? <FiCheck size={18} /> : <FiSettings size={18} />}
              {gerenciando ? "Concluir" : "Gerenciar perfis"}
            </button>
          </div>
        )}
      </main>

      {/* Confirmação de exclusão */}
      <ConfirmModal
        aberto={!!perfilParaExcluir}
        titulo="Excluir perfil?"
        mensagem={
          <>
            O perfil <strong>{perfilParaExcluir?.nome}</strong> e todos os seus
            dados serão excluídos. Esta ação não pode ser desfeita.
          </>
        }
        textoConfirmar="Sim, excluir"
        perigo
        carregando={excluindo}
        erro={erroExclusao}
        onConfirmar={excluirPerfil}
        onCancelar={() => {
          setPerfilParaExcluir(null);
          setErroExclusao("");
        }}
      />
    </div>
  );
}

// Foto do perfil; se não houver foto (ou ela não carregar), mostra a inicial.
function Avatar({ perfil }) {
  const [falhou, setFalhou] = useState(false);
  const classes =
    "h-24 w-24 rounded-full object-cover transition group-hover:scale-105";

  if (!perfil.urlFoto || falhou) {
    return (
      <div
        className={`${classes} flex items-center justify-center bg-[#cfe5f5] text-4xl font-bold text-[#365FB3]`}
        aria-hidden="true"
      >
        {perfil.nome?.trim()?.[0]?.toUpperCase() || "?"}
      </div>
    );
  }

  return (
    <img
      src={perfil.urlFoto}
      alt=""
      onError={() => setFalhou(true)}
      className={`${classes} object-cover`}
    />
  );
}
