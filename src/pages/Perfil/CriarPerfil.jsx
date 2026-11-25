import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, getApiError } from "../../services/api";

import { aviso } from "../../components/Aviso";
import BotaoVoltar from "../../components/BotaoVoltar";
import { useVoltar } from "../../services/navegacao";

import { Spinner } from "../../components/Carregando";

import papagaiandoImg from "../../assets/papagaiando.jpg";

export default function CriarPerfil() {
  const [nome, setNome] = useState("");
  const [fotoSelecionada, setFotoSelecionada] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const voltar = useVoltar("/meus-perfis");

  const imagensPapagaiando = [
    {
      nome: "verde",
      url: "https://bkueynyjbvxuavboqnja.supabase.co/storage/v1/object/public/perfil/papagaiando-verd.jpg",
    },
    {
      nome: "roxo",
      url: "https://bkueynyjbvxuavboqnja.supabase.co/storage/v1/object/public/perfil/papagaiando-roxo.jpg",
    },
    {
      nome: "rosa",
      url: "https://bkueynyjbvxuavboqnja.supabase.co/storage/v1/object/public/perfil/papagaiando-rosa.jpg",
    },
    {
      nome: "azul",
      url: "https://bkueynyjbvxuavboqnja.supabase.co/storage/v1/object/public/perfil/papagaiando-azul.jpg",
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nome || !fotoSelecionada) {
      aviso("Preencha o nome e escolha uma imagem", "erro");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("token");

    if (!token) {
      aviso("Usuário não autenticado. Faça login novamente.", "erro");
      setLoading(false);
      navigate("/", { replace: true }); // volta pro login
      return;
    }

    try {
      const payload = { nome, urlFoto: fotoSelecionada };

      const response = await fetch(`${API_BASE_URL}/perfis`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        aviso("Perfil criado com sucesso!", "sucesso");
        setNome("");
        setFotoSelecionada(null);
        voltar();
      } else if (response.status === 401) {
        aviso("Usuário não autenticado. Faça login novamente.", "erro");
        navigate("/", { replace: true }); // volta pro login
      } else {
        const mensagem = await getApiError(
          response,
          "Não foi possível criar o perfil.",
        );
        aviso("Erro ao criar perfil: " + mensagem, "erro");
      }
    } catch (error) {
      console.error("Erro ao criar perfil:", error);
      aviso("Erro ao criar perfil. Tente novamente.", "erro");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F8F5F3]">
      <header className="bg-[#365FB3] text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 sm:px-8">
          <div className="flex items-center gap-3">
            <img
              src={papagaiandoImg}
              alt=""
              className="h-11 w-11 rounded-xl object-cover"
            />
            <span className="text-xl font-bold">Papagaiando</span>
          </div>

          <span className="text-sm font-medium">Área do responsável</span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-5 pb-12 pt-8 sm:px-8 sm:pt-10">
        <button
          type="button"
          onClick={voltar}
          className="mb-5 text-sm font-semibold text-[#365FB3] hover:underline"
        >
          ‹ Gerenciar perfis
        </button>

        <h1 className="mb-8 text-3xl font-bold text-[#1F3F80] sm:text-4xl">
          Criar perfil
        </h1>

        <form
          onSubmit={handleSubmit}
          className="grid items-stretch gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,1fr)]"
        >
          <section className="flex flex-col rounded-3xl bg-white p-6 sm:p-8">
            <div>
              <label
                htmlFor="nome-perfil"
                className="mb-2 block font-semibold text-[#1F3F80]"
              >
                Nome do perfil
              </label>

              <input
                id="nome-perfil"
                type="text"
                placeholder="Digite o nome do perfil"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                disabled={loading}
                required
                className="w-full rounded-xl border border-[#A8BED6] bg-white px-4 py-3 text-[#1F3F80] outline-none focus:border-[#365FB3] focus:ring-2 focus:ring-[#365FB3]/20"
              />
            </div>

            <div className="mt-7">
              <p className="mb-4 font-semibold text-[#1F3F80]">
                Escolha uma imagem de perfil
              </p>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {imagensPapagaiando.map((img) => (
                  <button
                    key={img.nome}
                    type="button"
                    onClick={() => setFotoSelecionada(img.url)}
                    disabled={loading}
                    aria-label={`Selecionar papagaio ${img.nome}`}
                    aria-pressed={fotoSelecionada === img.url}
                    className={`flex aspect-square items-center justify-center rounded-2xl border-2 bg-[#F8F5F3] p-2 transition hover:border-[#365FB3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#365FB3] ${
                      fotoSelecionada === img.url
                        ? "border-[#365FB3] ring-2 ring-[#365FB3]/20"
                        : "border-[#D8E2EC]"
                    }`}
                  >
                    <img
                      src={img.url}
                      alt=""
                      className="h-full w-full rounded-xl object-contain"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-auto flex flex-wrap gap-3 pt-10">
              <button
                type="submit"
                disabled={loading}
                className="flex min-w-[170px] items-center justify-center gap-2 rounded-xl bg-[#365FB3] px-6 py-3 font-semibold text-white transition hover:bg-[#1F3F80] disabled:opacity-60"
              >
                {loading && <Spinner tamanho={18} />}
                {loading ? "Criando..." : "Criar perfil"}
              </button>

              <button
                type="button"
                onClick={voltar}
                disabled={loading}
                className="rounded-xl border border-[#A8BED6] bg-white px-6 py-3 font-semibold text-[#365FB3] transition hover:bg-[#F8F5F3] disabled:opacity-60"
              >
                Cancelar
              </button>
            </div>
          </section>

          <aside className="flex flex-col rounded-3xl bg-[#CFE5F5] p-6 sm:p-8">
            <h2 className="text-xl font-bold text-[#1F3F80]">Prévia</h2>

            <div className="flex flex-1 flex-col items-center justify-center gap-4 py-8">
              <div className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-2xl border border-[#A8BED6] bg-white p-4 sm:h-48 sm:w-48">
                {fotoSelecionada ? (
                  <img
                    src={fotoSelecionada}
                    alt="Imagem selecionada para o perfil"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span className="text-center text-sm text-[#617A98]">
                    Selecione uma imagem
                  </span>
                )}
              </div>

              <p className="break-words text-center text-lg font-semibold text-[#1F3F80]">
                {nome.trim() || "Nome do perfil"}
              </p>
            </div>
          </aside>
        </form>
      </main>
    </div>
  );
}