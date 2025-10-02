import { useState } from "react";
import papagaiandoImg from "../img/papagaiando.jpg";

export default function HeaderPerfil({ perfil, onMenuClick }) {
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <img 
              src={papagaiandoImg} 
              alt="Papagaiando" 
              className="h-10 w-auto"
            />
            <span className="ml-2 text-2xl font-bold text-blue-900">Papagaiando</span>
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
                  onClick={() => { setMenuAberto(false); onMenuClick('editar-perfil'); }}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  Editar Perfil
                </button>
                <button 
                  onClick={() => { setMenuAberto(false); onMenuClick('criar-botao'); }}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  Criar Botão
                </button>
                <button 
                  onClick={() => { setMenuAberto(false); onMenuClick('criar-categoria'); }}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  Criar Categoria
                </button>
                <button 
                  onClick={() => { setMenuAberto(false); onMenuClick('sair'); }}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  Sair do Perfil
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}