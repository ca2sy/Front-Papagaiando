import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import papagaiandoImg from "../../assets/papagaiando.jpg";
import { API_BASE_URL, getApiError } from "../../services/api";
import { aviso } from "../../components/Aviso";
import TelaCarregando from "../../components/Carregando";
import ConfirmModal from "../../components/ConfirmModal";
import { FiUser } from "react-icons/fi";
import { lerCache, salvarCache } from "../../services/cache";

export default function MeusPerfis() {
  // Mostra na hora os perfis já salvos e atualiza em segundo plano
  const [perfis, setPerfis] = useState(() => lerCache("perfis") || []);
  const [loading, setLoading] = useState(() => !lerCache("perfis"));
  const [perfilParaExcluir, setPerfilParaExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExclusao, setErroExclusao] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPerfis = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        navigate("/");
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
          setPerfis(data);
        } else {
          const mensagem = await getApiError(
            response,
            "Não foi possível carregar os perfis."
          );

          console.error("Erro ao buscar perfis:", mensagem);
          aviso(mensagem, "erro");

          if (response.status === 401) {
            navigate("/");
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
      navigate("/");
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
          await getApiError(
            response,
            "Não foi possível excluir o perfil."
          )
        );
      }

      setPerfis((anteriores) =>
        anteriores.filter(
          (perfil) => perfil.id !== perfilParaExcluir.id
        )
      );

      setPerfilParaExcluir(null);
    } catch (error) {
      setErroExclusao(
        error.message || "Não foi possível excluir o perfil."
      );
    } finally {
      setExcluindo(false);
    }
  };

  if (loading) {
    return <TelaCarregando texto="Carregando perfis..." />;
  }

  return (
    <div className="min-h-screen bg-[#b3daff]">
      <header className="bg-[#004687] shadow-md">
        <div className="flex justify-between items-center px-3 sm:px-5 py-3">
          <div className="flex items-center">
            <img
              src={papagaiandoImg}
              alt="Papagaiando"
              className="h-10 w-10 rounded-full object-cover"
            />
            <span className="ml-2 text-xl sm:text-2xl font-bold text-white">
              Papagaiando
            </span>
          </div>

          <button
            onClick={() => navigate("/minha-conta")}
            className="flex items-center gap-2 rounded-full bg-white px-4 py-2 font-semibold text-[#004687] shadow hover:bg-[#b3daff] transition"
          >
            <FiUser size={20} aria-hidden="true" />
            Minha conta
          </button>
        </div>
      </header>

      <div className="flex flex-col items-center justify-center py-8 sm:py-12 px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#004687] mb-2 sm:mb-3">
            Quem está usando?
          </h1>
          <p className="text-[#004687]/80 text-sm sm:text-base">
            Selecione um perfil para começar
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center items-center gap-6 sm:gap-10 max-w-3xl mx-auto w-full">
          {perfis.map((perfil) => (
            <div
              key={perfil.id}
              className="flex flex-col items-center group w-full sm:w-auto"
            >
              <button
                type="button"
                onClick={() =>
                  navigate(`/perfil/${perfil.id}/categorias`)
                }
                className="flex flex-col items-center"
              >
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-2 border-[#004687] group-hover:border-white transition-all duration-300 mb-3 sm:mb-4 overflow-hidden shadow-2xl">
                  <img
                    src={perfil.urlFoto}
                    alt={perfil.nome}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>

                <p className="text-[#004687] text-base sm:text-lg font-medium group-hover:text-white/90 transition-colors text-center">
                  {perfil.nome}
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setErroExclusao("");
                  setPerfilParaExcluir(perfil);
                }}
                className="mt-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                aria-label={`Excluir perfil ${perfil.nome}`}
              >
                Excluir
              </button>
            </div>
          ))}

          {perfis.length < 3 && (
            <button
              type="button"
              className="flex flex-col items-center group w-full sm:w-auto"
              onClick={() => navigate("/criar-perfil")}
            >
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-2 border-[#004687] flex items-center justify-center mb-3 sm:mb-4 group-hover:border-white group-hover:bg-white/10 transition-all duration-300">
                <div className="text-[#004687] text-4xl sm:text-5xl font-light group-hover:scale-110 transition-transform">
                  +
                </div>
              </div>

              <p className="text-[#004687] text-base sm:text-lg font-medium group-hover:text-white transition-colors text-center">
                Adicionar Perfil
              </p>
            </button>
          )}
        </div>
      </div>

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