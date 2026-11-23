import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import papagaiandoImg from "../../assets/papagaiando.jpg";
import { API_BASE_URL, getApiError } from "../../services/api";

export default function MeusPerfis() {
  const [perfis, setPerfis] = useState([]);
  const [loading, setLoading] = useState(true);
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
          alert(mensagem);

          if (response.status === 401) {
            navigate("/");
          }
        }
      } catch (error) {
        console.error("Erro de conexão:", error);
        alert("Erro de conexão com o servidor.");
      } finally {
        setLoading(false);
      }
    };

    fetchPerfis();
  }, [navigate]);

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
    return (
      <div className="min-h-screen bg-[#b3daff] flex items-center justify-center">
        <p className="text-[#004687] text-xl">
          Carregando perfis...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#b3daff]">
      <header className="bg-[#004687] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center">
              <img
                src={papagaiandoImg}
                alt="Papagaiando"
                className="h-8 w-auto"
              />
              <span className="ml-2 text-xl font-bold text-white">
                Papagaiando
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex justify-end px-6 pt-4">
        <button
          onClick={() => navigate("/minha-conta")}
          className="rounded-lg bg-white px-4 py-2 text-[#004687]"
        >
          Minha Conta
        </button>
      </div>

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

      {perfilParaExcluir && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="titulo-exclusao-perfil"
            aria-describedby="descricao-exclusao-perfil"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <h2
              id="titulo-exclusao-perfil"
              className="mb-3 text-xl font-bold text-[#004687]"
            >
              Excluir perfil?
            </h2>

            <p
              id="descricao-exclusao-perfil"
              className="mb-4 text-gray-700"
            >
              Deseja realmente excluir o perfil{" "}
              <strong>{perfilParaExcluir.nome}</strong>?
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
                  setPerfilParaExcluir(null);
                  setErroExclusao("");
                }}
                className="rounded-lg border border-[#004687] px-4 py-2 text-[#004687]"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={excluindo}
                onClick={excluirPerfil}
                className="rounded-lg bg-red-600 px-4 py-2 text-white disabled:opacity-50"
              >
                {excluindo ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}