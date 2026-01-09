import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import HeaderPerfil from "./components/HeaderPerfil.jsx";
import SenhaModal from "./components/SenhaModal.jsx";

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [perfil, setPerfil] = useState(null);
  const [showSenhaModal, setShowSenhaModal] = useState(false);
  const [acaoSelecionada, setAcaoSelecionada] = useState(null);

  const navigate = useNavigate();
  const { perfilId } = useParams();

  const carregarCategorias = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token || !perfilId) return;

    try {
      // Buscar perfil
      const perfilResponse = await fetch(`http://localhost:8080/perfis/${perfilId}`, {
        headers: { Authorization: "Bearer " + token }
      });
      if (perfilResponse.ok) {
        const perfilData = await perfilResponse.json();
        setPerfil(perfilData);
      }

      // Buscar categorias do perfil (isso já traz padrão + personalizadas)
      const categoriasResponse = await fetch(`http://localhost:8080/categorias/perfil/${perfilId}`, {
        headers: { Authorization: "Bearer " + token }
      });

      if (categoriasResponse.ok) {
        const data = await categoriasResponse.json();

        const categoriasComFlag = data.map(c => ({
          ...c,
          isPadrao: c.padrao
        }));

        setCategorias(categoriasComFlag);
      } else {
        setCategorias([]);
      }

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#b3daff] flex items-center justify-center">
        <p className="text-xl text-blue-900">Carregando categorias...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#b3daff]">
      <HeaderPerfil perfil={perfil} onMenuClick={handleMenuClick} />

      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        {categorias.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {categorias.map(categoria => (
              <CategoriaCard
                key={categoria.id}
                categoria={categoria}
                onClick={handleCategoriaClick}
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
            e.target.src = "https://via.placeholder.com/200?text=Sem+Imagem"; 
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