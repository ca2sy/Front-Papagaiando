import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api, { mensagemDeErro } from "../../services/api";
import SenhaModal from "../../components/SenhaModal.jsx";

export default function EditarPerfil() {
  const [nome, setNome] = useState("");
  const [fotoSelecionada, setFotoSelecionada] = useState(null);
  const [loading, setLoading] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [showSenhaModal, setShowSenhaModal] = useState(false);
  const navigate = useNavigate();
  const { perfilId } = useParams();

  const imagensPapagaiando = [
    { nome: "verde", url: "https://bkueynyjbvxuavboqnja.supabase.co/storage/v1/object/public/perfil/papagaiando-verd.jpg" },
    { nome: "roxo", url: "https://bkueynyjbvxuavboqnja.supabase.co/storage/v1/object/public/perfil/papagaiando-roxo.jpg" },
    { nome: "rosa", url: "https://bkueynyjbvxuavboqnja.supabase.co/storage/v1/object/public/perfil/papagaiando-rosa.jpg" },
    { nome: "azul", url: "https://bkueynyjbvxuavboqnja.supabase.co/storage/v1/object/public/perfil/papagaiando-azul.jpg" }
  ];

  useEffect(() => {
    const buscarPerfil = async () => {
      const token = localStorage.getItem("token");
      if (!token || !perfilId) {
        navigate("/");
        return;
      }

      try {
        const { data: perfil } = await api.get(`/perfis/${perfilId}`);
        setNome(perfil.nome);
        setFotoSelecionada(perfil.urlFoto);
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
        alert("Erro ao carregar perfil");

        if (error.response) {
          navigate("/meus-perfis");
        }
      } finally {
        setCarregando(false);
      }
    };

    buscarPerfil();
  }, [perfilId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nome || !fotoSelecionada) {
      alert("Preencha o nome e escolha uma imagem");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Usuário não autenticado. Faça login novamente.");
      setLoading(false);
      navigate("/");
      return;
    }

    try {
      const payload = { nome, urlFoto: fotoSelecionada };
      await api.put(`/perfis/${perfilId}`, payload);

      alert("Perfil atualizado com sucesso!");
      navigate(`/perfil/${perfilId}/categorias`);
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);

      if (error.response?.status === 401) {
        alert("Usuário não autenticado. Faça login novamente.");
      } else if (error.response) {
        alert("Erro ao atualizar perfil: " + (error.response.data?.message || "Tente novamente"));
      } else {
        alert("Erro ao atualizar perfil. Tente novamente.");
      }
    }
    setLoading(false);
  };

  const handleVoltar = () => {
    navigate(`/perfil/${perfilId}/categorias`);
  };

  const excluirPerfil = async () => {
    setShowSenhaModal(false);
    setLoading(true);

    try {
      await api.delete(`/perfis/${perfilId}`);
      alert("Perfil excluído com sucesso!");
      navigate("/meus-perfis");
    } catch (error) {
      console.error("Erro ao excluir perfil:", error);
      alert("Erro ao excluir perfil: " + mensagemDeErro(error, "Tente novamente"));
      setLoading(false);
    }
  };

  if (carregando) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#b3daff]">
        <p className="text-xl text-[#004687]">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#b3daff] p-4">
      <div className="bg-[#ffffff] backdrop-blur-md p-8 md:p-12 rounded-3xl shadow-2xl w-full max-w-md text-[#004687] border-2 border-[#004687]/30">
        <div className="flex items-center mb-6">
          <button
            onClick={handleVoltar}
            className="text-[#004687] hover:text-blue-100 mr-4"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-3xl font-extrabold">Editar Perfil</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            placeholder="Nome do perfil"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full px-4 py-3 rounded-lg text-[#004687] placeholder-[#67B5DF] focus:outline-none focus:ring-2 focus:ring-white bg-white border-2 border-[#004687]"
            required
          />

          <p className="text-[#004687] font-semibold mt-2">Escolha uma imagem de perfil:</p>
          <div className="flex flex-wrap gap-4 justify-center mt-2">
            {imagensPapagaiando.map((img, idx) => (
              <img
                key={idx}
                src={img.url}
                alt={img.nome}
                className={`w-24 h-24 rounded-xl cursor-pointer border-4 transition-transform transform hover:scale-105 ${
                  fotoSelecionada === img.url ? "border-white" : "border-white/50"
                }`}
                onClick={() => setFotoSelecionada(img.url)}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#004687] hover:bg-[#003366] transition font-semibold py-3 rounded-lg shadow-lg mt-4 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Salvando..." : "Salvar Alterações"}
          </button>
        </form>

        <button
          onClick={() => setShowSenhaModal(true)}
          disabled={loading}
          className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-center font-medium mt-4 rounded-lg"
        >
          Excluir Perfil
        </button>
      </div>

      <SenhaModal
        isOpen={showSenhaModal}
        onClose={() => setShowSenhaModal(false)}
        onConfirm={excluirPerfil}
        titulo="Excluir perfil"
        mensagem="Essa ação não pode ser desfeita. Digite sua senha para excluir o perfil:"
      />
    </div>
  );
}