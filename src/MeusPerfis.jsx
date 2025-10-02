import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
    return <p className="text-center mt-10">Carregando perfis...</p>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 to-blue-300 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-900">Meus Perfis</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {perfis.map((perfil) => (
          <div
            key={perfil.id}
            className="bg-white rounded-2xl shadow-lg p-4 flex flex-col items-center cursor-pointer hover:shadow-xl transition" 
            onClick={() => navigate(`/perfil/${perfil.id}/categorias`)}
          >
            <img
              src={perfil.urlFoto}
              alt={perfil.nome}
              className="w-24 h-24 rounded-full mb-4 object-cover"
            />
            <p className="font-semibold text-blue-900 text-lg">{perfil.nome}</p>
          </div>
        ))}

        {perfis.length < 3 && (
          <div
            className="bg-white rounded-2xl shadow-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:shadow-xl transition"
            onClick={() => navigate("/criar-perfil")}
          >
            <div className="w-24 h-24 rounded-full flex items-center justify-center bg-blue-100 mb-4 text-blue-600 text-3xl font-bold">
              +
            </div>
            <p className="font-semibold text-blue-900">Adicionar Perfil</p>
          </div>
        )}
      </div>
    </div>
  );
}
