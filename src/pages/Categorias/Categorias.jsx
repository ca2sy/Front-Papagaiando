import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import HeaderPerfil from "../../components/HeaderPerfil.jsx";
import SenhaModal from "../../components/SenhaModal.jsx";
import BotaoFala from "../../components/BotaoFala.jsx";
import { API_BASE_URL, getApiError } from "../../services/api";

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [perfil, setPerfil] = useState(null);
  const [showSenhaModal, setShowSenhaModal] = useState(false);
  const [acaoSelecionada, setAcaoSelecionada] = useState(null);
  const [categoriaParaExcluir, setCategoriaParaExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExclusao, setErroExclusao] = useState("");

  const navigate = useNavigate();
  const { perfilId } = useParams();

  const carregarCategorias = useCallback(async () => {
    const token = localStorage.getItem("token");

      if (!token || !perfilId) {
        setLoading(false);
        navigate(!token ? "/" : "/meus-perfis");
      return;
    }

    try {
      // Buscar perfil
      const perfilResponse = await fetch(`${API_BASE_URL}/perfis/${perfilId}`, {
        headers: { Authorization: "Bearer " + token }
      });

      if (perfilResponse.ok) {
        const perfilData = await perfilResponse.json();
        setPerfil(perfilData);
      }

      // Buscar categorias do perfil
      const categoriasResponse = await fetch(
        `${API_BASE_URL}/categorias/perfil/${perfilId}`,
        {
          headers: { Authorization: "Bearer " + token }
        }
      );

      if (categoriasResponse.ok) {
        const data = await categoriasResponse.json();

        const categoriasComFlag = data.map(c => ({
          ...c,
          isPadrao: c.padrao
        }));

        setCategorias(categoriasComFlag);

        const favoritosSalvos =
          JSON.parse(localStorage.getItem(`favoritos:${perfilId}`)) || [];

        setFavoritos(favoritosSalvos);

      } else {
         const mensagem = await getApiError(
          categoriasResponse,
          "Não foi possível carregar as categorias."
        );

        console.error("Erro ao buscar categorias:", mensagem);
        setCategorias([]);

        if (categoriasResponse.status === 401) {
          navigate("/");
        } else {
          alert(mensagem);
        }
      }

    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
      setCategorias([]);
    } finally {
      setLoading(false);
    }
  }, [perfilId, navigate]);

  useEffect(() => {
    carregarCategorias();
  }, [carregarCategorias]);

  useEffect(() => {
    const atualizarFavoritos = () => {
      try {
        const salvos = JSON.parse(
          localStorage.getItem(`favoritos:${perfilId}`) || "[]"
        );

        setFavoritos(Array.isArray(salvos) ? salvos : []);
      } catch {
        setFavoritos([]);
      }
    };

    atualizarFavoritos();

    window.addEventListener("favoritosAtualizados", atualizarFavoritos);

    return () => {
      window.removeEventListener(
        "favoritosAtualizados",
        atualizarFavoritos
      );
    };
  }, [perfilId]);

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
    if (!window.confirm(`Restaurar "${categoria.nome}" para o padrão?`)) return;

    const token = localStorage.getItem("token");
    if (!token) return navigate("/");

    try {
      const response = await fetch(
        `${API_BASE_URL}/categorias/${categoria.id}/restaurar?perfilId=${encodeURIComponent(perfilId)}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error(await getApiError(response));
      }

      const restaurada = await response.json();

      setCategorias((anteriores) =>
        anteriores.map((item) =>
          item.id === categoria.id ? restaurada : item
        )
      );
    } catch (error) {
      alert(error.message || "Erro ao restaurar categoria.");
    }
  };

  
  const reproduzirFavorito = (botao) => {
    if (!botao.urlAudio) return;

    const audio = new Audio(botao.urlAudio);

    audio.play().catch(() => {
      alert("Não foi possível reproduzir o áudio.");
    });
  };

  const handleCategoriaClick = (categoria) => {
    navigate(`/perfil/${perfilId}/categoria/${categoria.id}`);
  };

  const excluirCategoria = async () => {
    if (!categoriaParaExcluir || excluindo) return;

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
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
        }
      );

      if (!response.ok) {
        const mensagem = await getApiError(
          response,
          "Não foi possível excluir a categoria."
        );

        throw new Error(mensagem);
      }

      setCategorias((anteriores) =>
        anteriores.filter(
          (categoria) => categoria.id !== categoriaParaExcluir.id
        )
      );

      setCategoriaParaExcluir(null);
    } catch (error) {
      setErroExclusao(error.message);
    } finally {
      setExcluindo(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#b3daff] flex items-center justify-center">
        <p className="text-xl text-blue-900">
          Carregando categorias...
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

        {favoritos.length > 0 && (
          <>
            <h2 className="text-2xl font-bold text-blue-900 mb-4">
              Favoritos
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 mb-10">
              {favoritos.map(botao => (
                <BotaoFala
                  key={botao.id}
                  botao={botao}
                  perfilId={perfilId}
                  onClick={reproduzirFavorito}
                />
              ))}
            </div>
          </>
        )}

        <h2 className="text-2xl font-bold text-blue-900 mb-4">
          Categorias
        </h2>

        {categorias.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {categorias.map(categoria => (
              <div key={categoria.id} className="relative">
                <CategoriaCard
                  categoria={categoria}
                  onClick={handleCategoriaClick}
                />

                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/perfil/${perfilId}/categoria/${categoria.id}/editar`
                      )
                    }
                    className="bg-white text-[#004687] rounded-lg px-3 py-2 shadow-md text-sm font-semibold"
                    aria-label={`Editar categoria ${categoria.nome}`}
                  >
                    Editar
                  </button>

                  {categoria.padrao && categoria.personalizado && (
                    <button
                      type="button"
                      onClick={() => restaurarCategoria(categoria)}
                      className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[#004687]"
                    >
                      Restaurar
                    </button>
                  )}

                  {!categoria.padrao && (
                    <button
                      type="button"
                      onClick={() => {
                        setErroExclusao("");
                        setCategoriaParaExcluir(categoria);
                      }}
                      className="bg-white text-red-600 rounded-lg px-3 py-2 shadow-md text-sm font-semibold"
                      aria-label={`Excluir categoria ${categoria.nome}`}
                    >
                      Excluir
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-blue-900 text-lg mt-12">
            Nenhuma categoria encontrada.
          </p>
        )}
      </div>

      <SenhaModal
        isOpen={showSenhaModal}
        onClose={() => setShowSenhaModal(false)}
        onConfirm={handleSenhaConfirmada}
        titulo="Confirmar ação"
        mensagem="Por favor, digite sua senha para continuar:"
      />

      {categoriaParaExcluir && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="titulo-exclusao"
            aria-describedby="descricao-exclusao"
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
          >
            <h2
              id="titulo-exclusao"
              className="text-xl font-bold text-[#004687] mb-3"
            >
              Excluir categoria?
            </h2>

            <p
              id="descricao-exclusao"
              className="text-gray-700 mb-4"
            >
              Deseja realmente excluir a categoria{" "}
              <strong>{categoriaParaExcluir.nome}</strong>?
              Esta ação não poderá ser desfeita.
            </p>

            {erroExclusao && (
              <p role="alert" className="text-red-600 text-sm mb-4">
                {erroExclusao}
              </p>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                disabled={excluindo}
                onClick={() => {
                  setCategoriaParaExcluir(null);
                  setErroExclusao("");
                }}
                className="px-4 py-2 rounded-lg border border-[#004687] text-[#004687]"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={excluindo}
                onClick={excluirCategoria}
                className="px-4 py-2 rounded-lg bg-red-600 text-white disabled:opacity-50"
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

function CategoriaCard({ categoria, onClick }) {
  return (
    <div
      onClick={() => onClick(categoria)}
      className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-transform hover:scale-105 aspect-square flex flex-col"
    >
      <div className="flex-1 overflow-hidden">
        <img
          src={categoria.urlImagem}
          alt={categoria.nome}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src =
              "https://via.placeholder.com/200?text=Sem+Imagem";
          }}
        />
      </div>

      <div className="p-2 sm:p-3 text-center">
        <h3 className="font-bold text-xs sm:text-sm text-blue-900 truncate">
          {categoria.nome}
        </h3>
      </div>
    </div>
  );
}