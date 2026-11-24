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
  const [loading, setLoading] = useState(() => !Array.isArray(lerCache("perfis")));
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
            "Não foi possível carregar os perfis."
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
        }
      );

      if (!response.ok) {
        throw new Error(
          await getApiError(response, "Não foi possível excluir o perfil.")
        );
      }

      setPerfis((anteriores) =>
        anteriores.filter((perfil) => perfil.id !== perfilParaExcluir.id)
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
    <div className="min-h-screen bg-[#b3daff] flex flex-col">
      <header className="bg-[#004687] shadow-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 sm:px-6 py-3">
          <div className="flex items-center min-w-0">
            <img
              src={papagaiandoImg}
              alt=""
              className="h-10 w-10 rounded-full object-cover ring-2 ring-white/40"
            />
            <span className="ml-2 text-xl sm:text-2xl font-bold text-white truncate">
              Papagaiando
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/minha-conta")}
              className="flex items-center gap-2 rounded-full bg-white px-3 sm:px-4 py-2 font-semibold text-[#004687] shadow hover:bg-[#e6f3ff] transition"
            >
              <FiUser size={20} aria-hidden="true" />
              <span className="hidden sm:inline">Minha conta</span>
            </button>
            <button
              onClick={() => {
                sairDaConta();
                navigate("/", { replace: true });
              }}
              aria-label="Sair da conta"
              className="flex items-center gap-2 rounded-full px-3 sm:px-4 py-2 font-semibold text-white ring-1 ring-white/50 hover:bg-white/10 transition"
            >
              <FiLogOut size={20} aria-hidden="true" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center px-4 sm:px-6 py-10 sm:py-16">
        <div className="text-center mb-10 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#004687] mb-2">
            {gerenciando ? "Gerenciar perfis" : "Quem está usando?"}
          </h1>
          <p className="text-[#004687]/75 text-base sm:text-lg">{subtitulo}</p>
        </div>

        <ul className="flex w-full max-w-4xl flex-wrap justify-center gap-6 sm:gap-10">
          {perfis.map((perfil) => (
            <li key={perfil.id} className="relative w-[calc(50%-0.75rem)] sm:w-40">
              <button
                type="button"
                onClick={() => abrirPerfil(perfil)}
                aria-label={
                  gerenciando
                    ? `Editar perfil ${perfil.nome}`
                    : `Entrar no perfil ${perfil.nome}`
                }
                className="group flex w-full flex-col items-center rounded-2xl p-2 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#004687]/40"
              >
                <div className="relative mb-3 transition duration-200 group-hover:-translate-y-1">
                  <Avatar perfil={perfil} />
                  {gerenciando && (
                    <span className="absolute inset-0 flex items-center justify-center rounded-full bg-[#004687]/55 text-white">
                      <FiEdit2 size={32} aria-hidden="true" />
                    </span>
                  )}
                </div>
                <p className="w-full truncate text-center text-lg sm:text-xl font-semibold text-[#004687] group-hover:text-[#003366]">
                  {perfil.nome}
                </p>
              </button>

              {gerenciando && (
                <button
                  type="button"
                  onClick={() => pedirExclusao(perfil)}
                  aria-label={`Excluir perfil ${perfil.nome}`}
                  className="aviso-entrada absolute top-1 left-1/2 translate-x-4 sm:top-2 sm:translate-x-7 flex h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-red-600 text-white shadow-lg hover:bg-red-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-300"
                >
                  <FiTrash2 size={20} aria-hidden="true" />
                </button>
              )}

            </li>
          ))}

          {podeAdicionar && !gerenciando && (
            <li className="w-[calc(50%-0.75rem)] sm:w-40">
              <button
                type="button"
                onClick={() => navigate("/criar-perfil")}
                className="group flex w-full flex-col items-center rounded-2xl p-2 text-[#004687] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#004687]/40"
              >
                <span className="mb-3 flex h-28 w-28 sm:h-36 sm:w-36 items-center justify-center rounded-full border-[3px] border-dashed border-[#004687]/50 bg-white/40 transition duration-200 group-hover:-translate-y-1 group-hover:border-[#004687] group-hover:bg-white">
                  <FiPlus size={44} aria-hidden="true" />
                </span>
                <span className="text-lg sm:text-xl font-semibold">Novo perfil</span>
              </button>
            </li>
          )}
        </ul>

        {perfis.length > 0 && (
          <div className="mt-10 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => setGerenciando((atual) => !atual)}
              className={`inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold shadow transition focus:outline-none focus-visible:ring-4 focus-visible:ring-[#004687]/40 ${
                gerenciando
                  ? "bg-[#004687] text-white hover:bg-[#003366]"
                  : "bg-white text-[#004687] hover:bg-[#e6f3ff]"
              }`}
            >
              {gerenciando ? (
                <FiCheck size={20} aria-hidden="true" />
              ) : (
                <FiSettings size={20} aria-hidden="true" />
              )}
              <span>{gerenciando ? "Concluído" : "Gerenciar perfis"}</span>
            </button>
            <p className="text-sm text-[#004687]/70">
              {perfis.length} de {LIMITE_PERFIS} perfis
            </p>
          </div>
        )}
      </main>

      <ConfirmModal
        aberto={!!perfilParaExcluir}
        titulo="Excluir perfil?"
        mensagem={
          <>
            O perfil <strong>{perfilParaExcluir?.nome}</strong> e todos os
            botões e categorias dele serão apagados para sempre. Essa ação não
            pode ser desfeita.
          </>
        }
        textoConfirmar={excluindo ? "Excluindo..." : "Sim, excluir"}
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
    "h-28 w-28 sm:h-36 sm:w-36 rounded-full border-4 border-white shadow-lg transition group-hover:border-[#004687] group-hover:shadow-xl";

  if (!perfil.urlFoto || falhou) {
    return (
      <div
        className={`${classes} flex items-center justify-center bg-[#004687] text-4xl font-extrabold text-white`}
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
