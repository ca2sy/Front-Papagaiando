import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../services/supabase";
import { API_BASE_URL, getApiError } from "../../services/api";
import { Spinner } from "../../components/Carregando";
import BotaoVoltar from "../../components/BotaoVoltar";
import { useVoltar } from "../../services/navegacao";
import papagaiandoImg from "../../assets/papagaiando.jpg";

export default function CriarBotao() {
  const [nome, setNome] = useState("");
  const [imagemSelecionada, setImagemSelecionada] = useState(null);
  const [previewImagem, setPreviewImagem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("");
  const [carregandoCategorias, setCarregandoCategorias] = useState(true);

  // Estados para gravação de áudio
  const [gravando, setGravando] = useState(false);
  const [tempoGravacao, setTempoGravacao] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [permissaoAudio, setPermissaoAudio] = useState(false);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const intervaloRef = useRef(null);

  const { perfilId } = useParams();
  const voltar = useVoltar(`/perfil/${perfilId}/categorias`);

  // Carregar categorias do perfil
  useEffect(() => {
    const carregarCategorias = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${API_BASE_URL}/categorias/perfil/${perfilId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          setCategorias(data);
        } else {
          const mensagem = await getApiError(
            response,
            "Não foi possível carregar as categorias.",
          );

          setErro(mensagem);
        }
      } catch (error) {
        console.error("Erro:", error);
        setErro("Erro ao carregar categorias");
      } finally {
        setCarregandoCategorias(false);
      }
    };

    carregarCategorias();
  }, [perfilId]);

  // Solicitar permissão de áudio ao montar o componente
  useEffect(() => {
    const solicitarPermissaoAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        stream.getTracks().forEach((track) => track.stop()); // Para a stream imediatamente
        setPermissaoAudio(true);
      } catch (error) {
        console.error("Erro ao solicitar permissão de áudio:", error);
        setErro(
          "Permissão de microfone negada. Você precisa permitir o acesso ao microfone para gravar áudios.",
        );
        setPermissaoAudio(false);
      }
    };

    solicitarPermissaoAudio();
  }, []);

  // Limpar intervalo ao desmontar
  useEffect(() => {
    return () => {
      if (intervaloRef.current) {
        clearInterval(intervaloRef.current);
      }
    };
  }, []);

  const iniciarGravacao = async () => {
    try {
      if (!permissaoAudio) {
        setErro("Permissão de microfone necessária para gravar");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/wav" });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);

        // Para todas as tracks da stream
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setGravando(true);
      setTempoGravacao(0);

      // Iniciar contador de tempo
      intervaloRef.current = setInterval(() => {
        setTempoGravacao((tempo) => tempo + 1);
      }, 1000);
    } catch (error) {
      console.error("Erro ao iniciar gravação:", error);
      setErro("Erro ao acessar o microfone. Verifique as permissões.");
    }
  };

  const pararGravacao = () => {
    if (mediaRecorderRef.current && gravando) {
      mediaRecorderRef.current.stop();
      setGravando(false);

      if (intervaloRef.current) {
        clearInterval(intervaloRef.current);
      }
    }
  };

  const formatarTempo = (segundos) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const limparGravacao = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setTempoGravacao(0);

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
  };

  const handleImagemChange = (e) => {
    const arquivo = e.target.files[0];
    if (arquivo) {
      if (!arquivo.type.startsWith("image/")) {
        setErro("Por favor, selecione um arquivo de imagem válido");
        return;
      }
      if (arquivo.size > 5 * 1024 * 1024) {
        setErro("A imagem não pode ser maior que 5MB");
        return;
      }
      setImagemSelecionada(arquivo);
      setPreviewImagem(URL.createObjectURL(arquivo));
      setErro("");
    }
  };

  const handleVoltar = voltar;

  const uploadImagemSupabase = async (arquivo) => {
    const nomeArquivo = `${Date.now()}_${arquivo.name}`;
    const caminhoUpload = `botoes/perfil-${perfilId}/${nomeArquivo}`;

    const { error } = await supabase.storage
      .from("papagaiando-imagens")
      .upload(caminhoUpload, arquivo);

    if (error) {
      throw new Error(`Erro ao fazer upload da imagem: ${error.message}`);
    }

    const { data: urlData } = supabase.storage
      .from("papagaiando-imagens")
      .getPublicUrl(caminhoUpload);

    return urlData.publicUrl;
  };

  const uploadAudioSupabase = async (blob) => {
    const nomeArquivo = `${Date.now()}_gravacao.wav`;
    const caminhoUpload = `botoes/perfil-${perfilId}/${nomeArquivo}`;

    const { error } = await supabase.storage
      .from("papagaiando-audios")
      .upload(caminhoUpload, blob);

    if (error) {
      throw new Error(`Erro ao fazer upload do áudio: ${error.message}`);
    }

    const { data: urlData } = supabase.storage
      .from("papagaiando-audios")
      .getPublicUrl(caminhoUpload);

    return urlData.publicUrl;
  };

  const salvarBotaoBackend = async (urlImagem, urlAudio) => {
    const token = localStorage.getItem("token");

    const payload = {
      nome: nome,
      urlImagem: urlImagem,
      urlAudio: urlAudio,
      categoriaId: categoriaSelecionada,
      perfilId: perfilId,
    };

    const response = await fetch(`${API_BASE_URL}/botoes/personalizados`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const mensagem = await getApiError(
        response,
        "Não foi possível salvar o botão.",
      );

      throw new Error(mensagem);
    }

    return await response.json();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nome.trim()) {
      setErro("Por favor, digite o nome do botão");
      return;
    }

    if (!categoriaSelecionada) {
      setErro("Por favor, selecione uma categoria");
      return;
    }

    if (!imagemSelecionada) {
      setErro("Por favor, selecione uma imagem");
      return;
    }

    if (!audioBlob) {
      setErro("Por favor, grave um áudio");
      return;
    }

    setLoading(true);
    setErro("");
    setSucesso(false);

    try {
      const urlImagem = await uploadImagemSupabase(imagemSelecionada);
      const urlAudio = await uploadAudioSupabase(audioBlob);
      await salvarBotaoBackend(urlImagem, urlAudio);

      setSucesso(true);
      setTimeout(voltar, 1500);
    } catch (error) {
      console.error("Erro:", error);
      setErro(error.message || "Erro ao criar botão. Tente novamente.");
    } finally {
      setLoading(false);
    }
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
          onClick={handleVoltar}
          disabled={loading || gravando}
          className="mb-5 text-sm font-semibold text-[#365FB3] hover:underline disabled:opacity-60"
        >
          ‹ Voltar
        </button>

        <h1 className="mb-8 text-3xl font-bold text-[#1F3F80] sm:text-4xl">
          Criar botão
        </h1>

        <form
          onSubmit={handleSubmit}
          className="grid items-stretch gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,1fr)]"
        >
          <section className="flex flex-col rounded-3xl bg-white p-6 sm:p-8">
            <div>
              <label
                htmlFor="nome-botao"
                className="mb-2 block font-semibold text-[#1F3F80]"
              >
                Nome do botão
              </label>
              <input
                id="nome-botao"
                type="text"
                placeholder="Ex.: Água, Gato, Azul..."
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                disabled={loading || gravando}
                required
                className="w-full rounded-xl border border-[#A8BED6] bg-white px-4 py-3 text-[#1F3F80] outline-none focus:border-[#365FB3] focus:ring-2 focus:ring-[#365FB3]/20"
              />
            </div>

            <div className="mt-6">
              <label
                htmlFor="categoria-botao"
                className="mb-2 block font-semibold text-[#1F3F80]"
              >
                Categoria
              </label>

              <select
                id="categoria-botao"
                value={categoriaSelecionada}
                onChange={(e) => setCategoriaSelecionada(e.target.value)}
                disabled={loading || carregandoCategorias || gravando}
                required
                className="w-full rounded-xl border border-[#A8BED6] bg-white px-4 py-3 text-[#1F3F80] outline-none focus:border-[#365FB3] focus:ring-2 focus:ring-[#365FB3]/20"
              >
                <option value="">Selecione uma categoria</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nome}
                  </option>
                ))}
              </select>

              {carregandoCategorias && (
                <p className="mt-2 flex items-center gap-2 text-sm text-[#617A98]">
                  <Spinner tamanho={14} />
                  Carregando categorias...
                </p>
              )}
            </div>

            <div className="mt-7">
              <p className="mb-3 font-semibold text-[#1F3F80]">
                Imagem do botão
              </p>

              <input
                id="imagem-input"
                type="file"
                accept="image/*"
                onChange={handleImagemChange}
                disabled={loading || gravando}
                className="sr-only"
              />

              <label
                htmlFor="imagem-input"
                className={`flex min-h-32 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[#A8BED6] bg-[#F8F5F3] p-5 text-center transition ${
                  loading || gravando
                    ? "pointer-events-none opacity-60"
                    : "cursor-pointer hover:border-[#365FB3]"
                }`}
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#365FB3"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 16V4m0 0L7 9m5-5 5 5" />
                  <path d="M4 16v3a2 2 0 002 2h12a2 2 0 002-2v-3" />
                </svg>

                <span className="font-semibold text-[#365FB3]">
                  {imagemSelecionada
                    ? "Trocar imagem"
                    : "Escolher imagem do dispositivo"}
                </span>

                <span className="max-w-full break-all text-sm text-[#617A98]">
                  {imagemSelecionada
                    ? imagemSelecionada.name
                    : "PNG, JPG ou GIF até 5 MB"}
                </span>
              </label>
            </div>

            <div className="mt-7">
              <h2 className="mb-3 font-semibold text-[#1F3F80]">
                Áudio do botão
              </h2>

              <div className="rounded-2xl border border-[#D8E2EC] bg-[#F8F5F3] p-5">
                <p className="mb-5 text-sm text-[#617A98]">
                  Grave uma mensagem com o microfone ou envie um arquivo de
                  áudio.
                </p>

                {!permissaoAudio && (
                  <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                    Permita o acesso ao microfone para gravar. Você também pode
                    enviar um arquivo de áudio.
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-center gap-3">
                  {!gravando && !audioUrl ? (
                    <button
                      type="button"
                      onClick={iniciarGravacao}
                      disabled={!permissaoAudio || loading}
                      className="rounded-xl bg-[#365FB3] px-5 py-3 font-semibold text-white transition hover:bg-[#1F3F80] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Iniciar gravação
                    </button>
                  ) : gravando ? (
                    <>
                      <span
                        role="status"
                        className="rounded-xl bg-red-50 px-4 py-3 font-mono font-semibold text-red-700"
                      >
                        ● {formatarTempo(tempoGravacao)}
                      </span>

                      <button
                        type="button"
                        onClick={pararGravacao}
                        className="rounded-xl bg-[#1F3F80] px-5 py-3 font-semibold text-white"
                      >
                        Parar gravação
                      </button>
                    </>
                  ) : null}
                </div>

                {audioUrl && (
                  <div className="mt-5 rounded-xl border border-[#A8BED6] bg-white p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className="font-semibold text-[#1F3F80]">
                        Áudio selecionado
                      </span>

                      <button
                        type="button"
                        onClick={limparGravacao}
                        disabled={loading}
                        className="text-sm font-semibold text-red-600 hover:underline disabled:opacity-50"
                      >
                        Remover
                      </button>
                    </div>

                    <audio
                      controls
                      src={audioUrl}
                      className="w-full"
                      aria-label="Ouvir áudio do botão"
                    >
                      Seu navegador não suporta reprodução de áudio.
                    </audio>

                    {tempoGravacao > 0 && (
                      <p className="mt-2 text-xs text-[#617A98]">
                        Duração: {formatarTempo(tempoGravacao)}
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-5 border-t border-[#D8E2EC] pt-5 text-center">
                  <input
                    id="audio-upload"
                    type="file"
                    accept="audio/*"
                    disabled={loading || gravando}
                    className="sr-only"
                    onChange={(e) => {
                      const arquivo = e.target.files[0];
                      if (arquivo) {
                        setAudioBlob(arquivo);
                        setAudioUrl(URL.createObjectURL(arquivo));
                        setTempoGravacao(0);
                      }
                    }}
                  />

                  <label
                    htmlFor="audio-upload"
                    className={`inline-flex items-center justify-center rounded-xl border border-[#365FB3] bg-white px-5 py-3 font-semibold text-[#365FB3] transition ${
                      loading || gravando
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer hover:bg-[#EAF1FF]"
                    }`}
                  >
                    Enviar arquivo de áudio
                  </label>
                </div>
              </div>
            </div>

            {erro && (
              <p
                role="alert"
                className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {erro}
              </p>
            )}

            {sucesso && (
              <p
                role="status"
                className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
              >
                Botão criado com sucesso!
              </p>
            )}

            <div className="mt-auto flex flex-wrap gap-3 pt-10">
              <button
                type="submit"
                disabled={loading || gravando || carregandoCategorias}
                className="flex min-w-[170px] items-center justify-center gap-2 rounded-xl bg-[#365FB3] px-6 py-3 font-semibold text-white transition hover:bg-[#1F3F80] disabled:opacity-60"
              >
                {loading && <Spinner tamanho={18} />}
                {loading ? "Criando..." : "Criar botão"}
              </button>

              <button
                type="button"
                onClick={handleVoltar}
                disabled={loading || gravando}
                className="rounded-xl border border-[#A8BED6] bg-white px-6 py-3 font-semibold text-[#365FB3] transition hover:bg-[#F8F5F3] disabled:opacity-60"
              >
                Cancelar
              </button>
            </div>
          </section>

          <aside className="h-fit rounded-3xl bg-[#CFE5F5] p-6 sm:p-8">
            <h2 className="text-xl font-bold text-[#1F3F80]">Prévia</h2>

            <div className="flex flex-col items-center gap-4 pt-6 pb-2">
              <div className="flex aspect-[5/4] w-full max-w-[250px] items-center justify-center overflow-hidden rounded-2xl border border-[#A8BED6] bg-white p-5">
                {previewImagem ? (
                  <img
                    src={previewImagem}
                    alt="Prévia da imagem do botão"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-center text-[#617A98]">
                    <svg
                      width="42"
                      height="42"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="m21 15-5-5L5 21" />
                    </svg>

                    <span className="text-sm">Nenhuma imagem selecionada</span>
                  </div>
                )}
              </div>

              <p className="max-w-full break-words text-center text-lg font-semibold text-[#1F3F80]">
                {nome.trim() || "Nome do botão"}
              </p>
            </div>
          </aside>
        </form>
      </main>
    </div>
  );
}
