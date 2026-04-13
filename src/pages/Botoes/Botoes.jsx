import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import HeaderPerfil from "../../components/HeaderPerfil.jsx"
import SenhaModal from "../../components/SenhaModal.jsx";

export default function BotoesPage() {
  const [botoes, setBotoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [perfil, setPerfil] = useState(null);
  const [categoria, setCategoria] = useState(null);
  const [showSenhaModal, setShowSenhaModal] = useState(false);
  const [acaoSelecionada, setAcaoSelecionada] = useState(null);

  const navigate = useNavigate();
  const { perfilId, categoriaId } = useParams();

  const carregarDados = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token || !perfilId || !categoriaId) {
      setLoading(false);
      return;
    }

    try {
      // Buscar perfil
      const perfilResponse = await fetch(`http://localhost:8080/perfis/${perfilId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (perfilResponse.ok) {
        const perfilData = await perfilResponse.json();
        setPerfil(perfilData);
      }

      // Buscar botões
      const botoesResponse = await fetch(
        `http://localhost:8080/botoes/categoria/${categoriaId}`,
        { 
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (botoesResponse.ok) {
        const todosBotoes = await botoesResponse.json();
        setBotoes(todosBotoes);
      } else {
        console.error("Erro ao buscar botões:", botoesResponse.status);
        setBotoes([]);
      }

      // Buscar categoria
      const categoriasResponse = await fetch(
        `http://localhost:8080/categorias/perfil/${perfilId}`,
        { headers: { Authorization: `Bearer ${token}` }}
      );

      if (categoriasResponse.ok) {
        const todasCategorias = await categoriasResponse.json();
        const categoriaEncontrada = todasCategorias.find(c => c.id === categoriaId);
        
        if (categoriaEncontrada) {
          setCategoria(categoriaEncontrada);
        } else {
          console.error("Categoria não encontrada na lista do perfil");
        }
      } else {
        console.error("Erro ao buscar categorias:", categoriasResponse.status);
      }

    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setBotoes([]);
    } finally {
      setLoading(false);
    }
  }, [perfilId, categoriaId]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

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
        navigate(`/criar-botao/${perfilId}`, { 
          state: { categoriaId: categoriaId } 
        });
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
    if (botao.urlAudio) {
      const audio = new Audio(botao.urlAudio);
      audio.play().catch(error => {
        console.error("Erro ao reproduzir áudio:", error);
        alert("Não foi possível reproduzir o áudio");
      });
    }
  };

  const handleVoltar = () => {
    navigate(`/perfil/${perfilId}/categorias`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#b3daff] flex items-center justify-center">
        <p className="text-xl text-blue-900">Carregando botões...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#b3daff]">
      <HeaderPerfil perfil={perfil} onMenuClick={handleMenuClick} />

      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleVoltar}
            className="flex items-center text-blue-900 hover:text-[#004687] font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar
          </button>
          
          {categoria && (
            <div className="text-center flex-1">
              <h1 className="text-2xl font-bold text-blue-900">
                {categoria.nome}
              </h1>
            </div>
          )}
          
          <button
            onClick={() => handleMenuClick("criar-botao")}
            className="bg-[#004687] hover:bg-[#003D99] text-white px-4 py-2 rounded-lg font-medium"
          >
            + Botão
          </button>
        </div>

        {/* Grid de botões */}
        {botoes.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {botoes.map(botao => (
              <div
                key={botao.id}
                className="flex flex-col items-center cursor-pointer group"
                onClick={() => handleBotaoClick(botao)}
              >
                {/* Botão retangular com imagem */}
                <div className="w-full aspect-square bg-white rounded-xl shadow-lg overflow-hidden border-2 border-transparent group-hover:border-blue-500 transition-all duration-300 hover:scale-105 hover:shadow-xl">
                  <img
                    src={botao.urlImagem}
                    alt={botao.nome}
                    className="w-full h-full object-cover"
                    onError={(e) => { 
                      e.target.src = "https://via.placeholder.com/200?text=📻"; 
                    }}
                  />
                </div>
                
                {/* Nome do botão abaixo da imagem */}
                <div className="mt-3 text-center w-full">
                  <h3 className="font-medium text-sm text-blue-900 truncate">
                    {botao.nome}
                  </h3>
                </div>
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