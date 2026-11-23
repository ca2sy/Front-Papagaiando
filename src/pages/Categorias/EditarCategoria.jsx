import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL, getApiError } from "../../services/api";

export default function EditarCategoria() {
  const { perfilId, categoriaId } = useParams();
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [urlImagem, setUrlImagem] = useState("");
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const voltar = () => {
    navigate(`/perfil/${perfilId}/categorias`);
  };

  useEffect(() => {
    const carregarCategoria = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/");
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/categorias/${categoriaId}?perfilId=${encodeURIComponent(perfilId)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            await getApiError(
              response,
              "Não foi possível carregar a categoria."
            )
          );
        }

        const categoria = await response.json();

        setNome(categoria.nome);
        setUrlImagem(categoria.urlImagem || "");
      } catch (error) {
        setErro(error.message);
      } finally {
        setLoading(false);
      }
    };

    carregarCategoria();
  }, [categoriaId, perfilId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");

    if (!nome.trim()) {
      setErro("Informe o nome da categoria.");
      return;
    }

    if (!urlImagem.trim()) {
      setErro("Informe a URL da imagem.");
      return;
    }

    setSalvando(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/categorias/${categoriaId}?perfilId=${encodeURIComponent(perfilId)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            nome: nome.trim(),
            urlImagem: urlImagem.trim(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          await getApiError(
            response,
            "Não foi possível atualizar a categoria."
          )
        );
      }

      voltar();
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#b3daff] flex items-center justify-center">
        <p className="text-[#004687]">Carregando categoria...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#b3daff] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-[#004687] mb-6 text-center">
          Editar Categoria
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="nome"
              className="block text-[#004687] font-medium mb-2"
            >
              Nome da categoria
            </label>

            <input
              id="nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              disabled={salvando}
              className="w-full p-3 rounded-lg border-2 border-[#004687] text-[#004687]"
              required
            />
          </div>

          <div>
            <label
              htmlFor="urlImagem"
              className="block text-[#004687] font-medium mb-2"
            >
              URL da imagem
            </label>

            <input
              id="urlImagem"
              type="text"
              value={urlImagem}
              onChange={(e) => setUrlImagem(e.target.value)}
              disabled={salvando}
              className="w-full p-3 rounded-lg border-2 border-[#004687] text-[#004687]"
              required
            />

            {urlImagem && (
              <img
                src={urlImagem}
                alt="Prévia da categoria"
                className="w-32 h-32 object-cover rounded-lg mx-auto mt-4"
              />
            )}
          </div>

          {erro && (
            <p role="alert" className="text-red-600 text-sm">
              {erro}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={voltar}
              className="flex-1 p-3 rounded-lg border-2 border-[#004687] text-[#004687]"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={salvando}
              className="flex-1 p-3 rounded-lg bg-[#004687] text-white disabled:opacity-50"
            >
              {salvando ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}