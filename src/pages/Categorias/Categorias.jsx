import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaPen } from "react-icons/fa";
import HeaderPerfil from "../../components/HeaderPerfil.jsx";
import SenhaModal from "../../components/SenhaModal.jsx";
import BotaoFala from "../../components/BotaoFala.jsx";
import api from "../../services/api";

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [perfil, setPerfil] = useState(null);
  const [showSenhaModal, setShowSenhaModal] = useState(false);
  const [acaoSelecionada, setAcaoSelecionada] = useState(null);
  const [busca, setBusca] = useState("");
  const [resultadoBusca, setResultadoBusca] = useState(null);

  const navigate = useNavigate();
  const { perfilId } = useParams();

  const carregarCategorias = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token || !perfilId) return;

    try {
      // Buscar perfil
      const perfilResponse = await api.get(`/perfis/${perfilId}`);
      setPerfil(perfilResponse.data);

      // Buscar categorias do perfil
      const categoriasResponse = await api.get(
        `/categorias/perfil/${perfilId}`
      );

      const categoriasComFlag = categoriasResponse.data.map(c => ({
        ...c,
        isPadrao: c.padrao
      }));

      setCategorias(categoriasComFlag);

      const favoritosSalvos =
        JSON.parse(localStorage.getItem("favoritos")) || [];

      setFavoritos(favoritosSalvos);

    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
      setCategorias([]);
    } finally {
      setLoading(false);
    }
  }, [perfilId]);

  useEffect(() => {
    carregarCategorias();
  }, [carregarCategorias]);

  useEffect(() => {
    const termo = busca.trim();
    if (!termo) return;

    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get(
          `/categorias/perfil/${perfilId}/buscar`,
          { params: { nome: termo } }
        );
        setResultadoBusca(data);
      } catch (error) {
        console.error("Erro ao buscar categorias:", error);
        setResultadoBusca([]);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [busca, perfilId]);

  const categoriasExibidas =
    busca.trim() && resultadoBusca ? resultadoBusca : categorias;

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

  const handleCategoriaClick = (categoria) => {
    navigate(`/perfil/${perfilId}/categoria/${categoria.id}`);
  };

  const handleEditarCategoria = (categoria) => {
    navigate(`/editar-categoria/${perfilId}/${categoria.id}`);
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
                  onClick={() => {}}
                />
              ))}
            </div>
          </>
        )}

        <h2 className="text-2xl font-bold text-blue-900 mb-4">
          Categorias
        </h2>

        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full px-4 py-3 rounded-lg text-[#004687] placeholder-[#004687] focus:outline-none focus:ring-2 focus:ring-[#004687] border border-[#004687] bg-white mb-6"
          placeholder="Buscar categoria pelo nome"
        />

        {categoriasExibidas.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {categoriasExibidas.map(categoria => (
              <CategoriaCard
                key={categoria.id}
                categoria={categoria}
                onClick={handleCategoriaClick}
                onEditar={handleEditarCategoria}
              />
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
    </div>
  );
}

function CategoriaCard({ categoria, onClick, onEditar }) {
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

      <div className="p-2 sm:p-3 text-center flex items-center">
        <h3 className="flex-1 font-bold text-xs sm:text-sm text-blue-900 truncate">
          {categoria.nome}
        </h3>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onEditar(categoria);
          }}
          className="ml-2 text-blue-900 text-sm transition-transform hover:scale-110"
        >
          <FaPen />
        </button>
      </div>
    </div>
  );
}