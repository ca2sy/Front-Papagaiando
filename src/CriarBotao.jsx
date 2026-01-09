import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://bkueynyjbvxuavboqnja.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrdWV5bnlqYnZ4dWF2Ym9xbmphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMzgwNzEsImV4cCI6MjA3MDYxNDA3MX0.c_9cK5NIgi9e-Tf-xRw3gDi2SJbyxPPb8lBj9Usvck0";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

  const navigate = useNavigate();
  const { perfilId } = useParams();

  // Carregar categorias do perfil
  useEffect(() => {
    const carregarCategorias = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:8080/categorias/perfil/${perfilId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setCategorias(data);
        } else {
          setErro("Erro ao carregar categorias");
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
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop()); // Para a stream imediatamente
        setPermissaoAudio(true);
      } catch (error) {
        console.error("Erro ao solicitar permissão de áudio:", error);
        setErro("Permissão de microfone negada. Você precisa permitir o acesso ao microfone para gravar áudios.");
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
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        
        // Para todas as tracks da stream
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setGravando(true);
      setTempoGravacao(0);

      // Iniciar contador de tempo
      intervaloRef.current = setInterval(() => {
        setTempoGravacao(tempo => tempo + 1);
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
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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

  const handleVoltar = () => {
    navigate(`/perfil/${perfilId}/categorias`);
  };

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
    };

    const response = await fetch("http://localhost:8080/botoes/personalizados", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Erro ao salvar botão: ${errorData.message || "Tente novamente"}`
      );
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
      setTimeout(() => {
        navigate(`/perfil/${perfilId}/categorias`);
      }, 1500);
    } catch (error) {
      console.error("Erro:", error);
      setErro(error.message || "Erro ao criar botão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#b3daff] p-4">
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-[#ffffff] backdrop-blur-md p-8 md:p-12 rounded-3xl shadow-2xl w-full max-w-md text-[#004687] border-2 border-white/30">
          <div className="flex items-center mb-6">
            <button
              onClick={handleVoltar}
              className="text-[#004687] hover:text-blue-100 mr-4 disabled:opacity-50"
              disabled={loading || gravando}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <h1 className="text-3xl font-extrabold">Criar Botão</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-base font-medium mb-2 text-[#004687]">
                Nome do Botão
              </label>
              <input
                type="text"
                placeholder="Ex: Gato, Azul, etc."
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full px-4 py-3 rounded-lg text-[#004687] placeholder-[#004687] focus:outline-none focus:ring-2 focus:ring-white bg-white border border-[#004687] p-2 rounded"
                disabled={loading || gravando}
                required
              />
            </div>

            <div>
              <label className="block text-base font-medium mb-2 text-[#004687]">
                Categoria
              </label>
              <select
                value={categoriaSelecionada}
                onChange={(e) => setCategoriaSelecionada(e.target.value)}
                className="w-full px-4 py-3 rounded-lg text-[#004687] focus:outline-none focus:ring-2 focus:ring-white bg-white border border-[#004687] p-2 rounded"
                disabled={loading || carregandoCategorias || gravando}
                required
              >
                <option value="">Selecione uma categoria</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nome}
                  </option>
                ))}
              </select>
              {carregandoCategorias && (
                <p className="text-sm text-white/80 mt-1">Carregando categorias...</p>
              )}
            </div>

            <div>
              <label className="block text-base font-medium mb-2 text-[#004687]">
                Imagem do Botão
              </label>
              <div className="border-2 border-dashed border-[#004687]/50 rounded-lg p-6 text-center cursor-pointer hover:border-white transition">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImagemChange}
                  className="hidden"
                  id="imagem-input"
                  disabled={loading || gravando}
                />
                <label
                  htmlFor="imagem-input"
                  className="cursor-pointer block"
                >
                  {previewImagem ? (
                    <div className="space-y-3">
                      <img
                        src={previewImagem}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg mx-auto"
                      />
                      <p className="text-sm text-[#004687]/80">
                        Clique para alterar imagem
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <svg
                        className="mx-auto h-12 w-12 text-[#004687]/60"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20a4 4 0 004 4h24a4 4 0 004-4V16a4 4 0 00-4-4z"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <circle
                          cx="20"
                          cy="20"
                          r="3"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M44 24l-8-8-16 16-8-8"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <p className="text-sm font-medium">
                        Clique para fazer upload da imagem
                      </p>
                      <p className="text-xs text-[#004687]/80">
                        PNG, JPG, GIF até 5MB
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div>
              <label className="block text-base font-medium mb-2 text-[#004687]">
                Áudio do Botão
              </label>
              
              {!permissaoAudio && (
                <div className="bg-red-500/20 border border-red-400 text-[#004687] px-4 py-3 rounded-lg text-sm mb-4">
                  Permissão de microfone necessária. Por favor, permita o acesso ao microfone no seu navegador.
                </div>
              )}

              <div className="space-y-4">
                {/* Controles de gravação */}
                <div className="flex items-center justify-center space-x-4">
                  {!gravando && !audioUrl ? (
                    <button
                      type="button"
                      onClick={iniciarGravacao}
                      disabled={!permissaoAudio || loading}
                      className="flex items-center space-x-2 bg-[#004687] hover:bg-[#003366] text-white px-6 py-3 rounded-lg font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                      </svg>
                      <span>Iniciar Gravação</span>
                    </button>
                  ) : gravando ? (
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2 bg-[#004687] text-white px-4 py-2 rounded-lg">
                        <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                        <span className="font-mono">{formatarTempo(tempoGravacao)}</span>
                      </div>
                      <button
                        type="button"
                        onClick={pararGravacao}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                      >
                        Parar
                      </button>
                    </div>
                  ) : null}
                </div>

                {/* Player de áudio gravado */}
                {audioUrl && (
                  <div className="bg-green-500/20 border border-green-400 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">Áudio gravado</span>
                      <button
                        type="button"
                        onClick={limparGravacao}
                        className="text-white/70 hover:text-white"
                        disabled={loading}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <audio controls className="w-full">
                      <source src={audioUrl} type="audio/wav" />
                      Seu navegador não suporta o elemento de áudio.
                    </audio>
                    <p className="text-xs text-white/80 mt-2">
                      Duração: {formatarTempo(tempoGravacao)}
                    </p>
                  </div>
                )}

                {/* Alternativa de upload */}
                <div className="text-center">
                  <p className="text-sm text-[#004687]/80 mb-2">Ou faça upload de um arquivo de áudio</p>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => {
                      const arquivo = e.target.files[0];
                      if (arquivo) {
                        setAudioBlob(arquivo);
                        setAudioUrl(URL.createObjectURL(arquivo));
                        setTempoGravacao(0);
                      }
                    }}
                    className="hidden"
                    id="audio-upload"
                    disabled={loading || gravando}
                  />
                  <label
                    htmlFor="audio-upload"
                    className="inline-flex items-center space-x-2 bg-[#004687] hover:bg-[#003366] text-white px-4 py-2 rounded-lg cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Upload de Áudio</span>
                  </label>
                </div>
              </div>
            </div>

            {erro && (
              <div className="bg-red-500/20 border border-red-400 text-[#004687] px-4 py-3 rounded-lg text-sm">
                {erro}
              </div>
            )}

            {sucesso && (
              <div className="bg-green-500/20 border border-green-400 text-white px-4 py-3 rounded-lg text-sm">
                Botão criado com sucesso!
              </div>
            )}

            <button
              type="submit"
              disabled={loading || gravando || carregandoCategorias}
              className="w-full bg-[#004687] hover:bg-[#003366] transition font-semibold py-3 rounded-lg shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed text-white"
            >
              {loading ? "Criando botão..." : "Criar Botão"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}