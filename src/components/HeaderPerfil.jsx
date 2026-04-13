import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import papagaiandoImg from "../assets/papagaiando.jpg";

export default function HeaderPerfil({ perfil, onMenuClick }) {
  const [menuAberto, setMenuAberto] = useState(false);
  const navigate = useNavigate();
  const { perfilId } = useParams();

  const handleMenuClick = (acao) => {
    setMenuAberto(false);
    
    if (acao === 'criar-categoria') {
      navigate(`/criar-categoria/${perfilId}`);
    } else if (acao === 'criar-botao') {
      navigate(`/criar-botao/${perfilId}`);
    } else if (acao === 'editar-perfil') {
      navigate(`/editar-perfil/${perfilId}`);
    } else if (acao === 'sair') {
      navigate(`/meus-perfis`);
    } else if (acao === 'sair-conta') {
      // Limpa dados de autenticação
      localStorage.clear();
      sessionStorage.clear();
      // Redireciona para o login
      navigate('/');
    } else {
      onMenuClick(acao);
    }
  };

  return (
    <header className="bg-[#004280] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <img 
              src={papagaiandoImg} 
              alt="Papagaiando" 
              className="h-10 w-auto"
            />
            <span className="ml-2 text-2xl font-bold text-white">Papagaiando</span>
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setMenuAberto(!menuAberto)}
              className="flex items-center space-x-2 bg-gray-100 rounded-full p-2 hover:bg-gray-200"
            >
              <img 
                src={perfil?.urlFoto} 
                alt={perfil?.nome}
                className="w-8 h-8 rounded-full"
              />
              <span>☰</span>
            </button>
            
            {menuAberto && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <button 
                  onClick={() => handleMenuClick('editar-perfil')}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  Editar Perfil
                </button>
                <button 
                  onClick={() => handleMenuClick('criar-botao')}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  Criar Botão
                </button>
                <button 
                  onClick={() => handleMenuClick('criar-categoria')}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  Criar Categoria
                </button>
                <button 
                  onClick={() => handleMenuClick('sair')}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  Sair do Perfil
                </button>
                <hr className="my-1" />
                <button 
                  onClick={() => handleMenuClick('sair-conta')}
                  className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left font-medium"
                >
                  Sair da Conta
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}