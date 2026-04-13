import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import papagaiandoImg from "../../assets/papagaiando.jpg"
export default function MeusPerfis() {
  const [perfis, setPerfis] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPerfis = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch("http://localhost:8080/perfis/me", {
          headers: {
            Authorization: "Bearer " + token,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setPerfis(data);
        } else {
          console.error("Erro ao buscar perfis");
        }
      } catch (error) {
        console.error("Erro de conexão:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPerfis();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#b3daff] flex items-center justify-center">
        <p className="text-white text-xl">Carregando perfis...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#b3daff]">
      {/* Header Compacto */}
      <header className="bg-[#004687] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center">
              <img 
                src={papagaiandoImg} 
                alt="Papagaiando" 
                className="h-8 w-auto"
              />
              <span className="ml-2 text-xl font-bold text-white">Papagaiando</span>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Centralizado */}
      <div className="flex flex-col items-center justify-center py-8 sm:py-12 px-4 sm:px-6">
        {/* Título */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#004687] mb-2 sm:mb-3">Quem está usando?</h1>
          <p className="text-[#004687]/80 text-sm sm:text-base">Selecione um perfil para começar</p>
        </div>

        {/* Grid de Perfis - Responsivo */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center items-center gap-6 sm:gap-10 max-w-3xl mx-auto w-full">
          {perfis.map((perfil) => (
            <div
              key={perfil.id}
              className="flex flex-col items-center cursor-pointer group w-full sm:w-auto"
              onClick={() => navigate(`/perfil/${perfil.id}/categorias`)}
            >
              {/* Avatar Circular - Aumentado */}
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-2 border-[#004687] group-hover:border-white transition-all duration-300 mb-3 sm:mb-4 overflow-hidden shadow-2xl">
                <img
                  src={perfil.urlFoto}
                  alt={perfil.nome}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              {/* Nome do Perfil */}
              <p className="text-[#004687] text-base sm:text-lg font-medium group-hover:text-white/90 transition-colors text-center">
                {perfil.nome}
              </p>
            </div>
          ))}

          {/* Botão Adicionar Perfil */}
          {perfis.length < 3 && (
            <div
              className="flex flex-col items-center cursor-pointer group w-full sm:w-auto"
              onClick={() => navigate("/criar-perfil")}
            >
              {/* Círculo de Adicionar - Aumentado */}
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-2 border-[#004687] flex items-center justify-center mb-3 sm:mb-4 group-hover:border-white group-hover:bg-white/10 transition-all duration-300">
                <div className="text-[#004687] text-4xl sm:text-5xl font-light group-hover:scale-110 transition-transform">
                  +
                </div>
              </div>
              {/* Texto */}
              <p className="text-[#004687] text-base sm:text-lg font-medium group-hover:text-white transition-colors text-center">
                Adicionar Perfil
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}