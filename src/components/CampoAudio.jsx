import { useEffect, useRef, useState } from "react";
import { FiMic, FiLink, FiSquare, FiVolume2, FiTrash2 } from "react-icons/fi";

const DURACAO_MAXIMA_S = 30;

function formatarTempo(segundos) {
  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// Escolha de áudio: gravar pelo microfone ou colar um link.
// O pai guarda `url` (link) e `gravacao` (Blob); se houver gravação, ela tem prioridade.
export default function CampoAudio({
  rotulo = "Áudio",
  url,
  onUrlChange,
  gravacao,
  onGravacaoChange,
  onErro,
  disabled = false,
}) {
  const [modo, setModo] = useState("gravar");
  const [gravando, setGravando] = useState(false);
  const [segundos, setSegundos] = useState(0);
  const [previewGravacao, setPreviewGravacao] = useState(null);

  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  // Prévia da gravação
  useEffect(() => {
    if (!gravacao) {
      setPreviewGravacao(null);
      return;
    }
    const objeto = URL.createObjectURL(gravacao);
    setPreviewGravacao(objeto);
    return () => URL.revokeObjectURL(objeto);
  }, [gravacao]);

  // Ao sair da tela: para microfone e contador
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      if (recorderRef.current?.state === "recording")
        recorderRef.current.stop();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const pararGravacao = () => {
    clearInterval(timerRef.current);
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    setGravando(false);
  };

  // Para sozinho ao chegar no tempo máximo
  useEffect(() => {
    if (gravando && segundos >= DURACAO_MAXIMA_S) pararGravacao();
  }, [gravando, segundos]);

  const iniciarGravacao = async () => {
    if (
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      onErro?.(
        "Este navegador não permite gravar áudio. Use a opção de colar um link.",
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      const pedacos = [];
      recorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) pedacos.push(e.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        if (pedacos.length) {
          onGravacaoChange(
            new Blob(pedacos, { type: recorder.mimeType || "audio/webm" }),
          );
        }
      };

      onErro?.("");
      recorder.start();
      setGravando(true);
      setSegundos(0);

      timerRef.current = setInterval(() => setSegundos((s) => s + 1), 1000);
    } catch (error) {
      console.error("Erro ao acessar o microfone:", error);
      onErro?.(
        error?.name === "NotAllowedError"
          ? "O microfone foi bloqueado. Libere o acesso nas configurações do navegador."
          : "Não foi possível acessar o microfone.",
      );
    }
  };

  const trocarModo = (novo) => {
    if (gravando) pararGravacao();
    setModo(novo);
  };

  const preview = previewGravacao || url;

  const abaClasse = (ativa) =>
    `flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
      ativa
        ? "bg-white text-[#004687] shadow"
        : "text-[#004687]/70 hover:text-[#004687]"
    }`;

  return (
    <div>
      <p className="block text-[#004687] font-medium mb-2">{rotulo}</p>

      {/* Prévia do áudio que será salvo */}
      <div className="mb-3 rounded-xl border-2 border-dashed border-[#004687]/30 bg-[#b3daff]/20 p-3">
        {preview ? (
          <>
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-[#004687]/80">
              <FiVolume2 aria-hidden="true" />
              {previewGravacao ? "Nova gravação" : "Áudio atual"}
            </p>
            <audio key={preview} controls src={preview} className="w-full" />
          </>
        ) : (
          <p className="py-3 text-center text-sm text-[#004687]/60">
            Nenhum áudio escolhido
          </p>
        )}
      </div>

      <div
        role="tablist"
        className="mb-3 flex gap-1 rounded-xl bg-[#b3daff]/40 p-1"
      >
        <button
          type="button"
          role="tab"
          aria-selected={modo === "gravar"}
          onClick={() => trocarModo("gravar")}
          disabled={disabled}
          className={abaClasse(modo === "gravar")}
        >
          <FiMic size={18} /> Gravar áudio
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={modo === "link"}
          onClick={() => trocarModo("link")}
          disabled={disabled}
          className={abaClasse(modo === "link")}
        >
          <FiLink size={18} /> Colar link
        </button>
      </div>

      {modo === "gravar" ? (
        <div>
          {gravando ? (
            <button
              type="button"
              onClick={pararGravacao}
              className="flex w-full flex-col items-center gap-1 rounded-xl border-2 border-red-600 bg-red-50 px-4 py-4 text-red-700 transition hover:bg-red-100"
            >
              <span className="flex items-center gap-2 font-semibold">
                <span
                  className="h-3 w-3 animate-pulse rounded-full bg-red-600"
                  aria-hidden="true"
                />
                Gravando… {formatarTempo(segundos)}
              </span>
              <span className="flex items-center gap-1 text-xs">
                <FiSquare aria-hidden="true" /> Toque para parar (máx.{" "}
                {DURACAO_MAXIMA_S}s)
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={iniciarGravacao}
              disabled={disabled}
              className="flex w-full flex-col items-center gap-1 rounded-xl border-2 border-[#004687] px-4 py-4 text-[#004687] transition hover:bg-blue-50 disabled:opacity-50"
            >
              <FiMic size={26} aria-hidden="true" />
              <span className="font-semibold">
                {gravacao ? "Gravar de novo" : "Começar a gravar"}
              </span>
              <span className="text-xs text-[#004687]/70">
                Fale perto do microfone
              </span>
            </button>
          )}

          {gravacao && !gravando && (
            <button
              type="button"
              onClick={() => onGravacaoChange(null)}
              disabled={disabled}
              className="mt-2 flex w-full items-center justify-center gap-1 text-sm font-semibold text-red-600 hover:underline"
            >
              <FiTrash2 aria-hidden="true" />
              Descartar gravação e manter o áudio anterior
            </button>
          )}
        </div>
      ) : (
        <div>
          <input
            type="url"
            value={url}
            onChange={(e) => {
              onGravacaoChange(null);
              onUrlChange(e.target.value);
            }}
            disabled={disabled}
            placeholder="https://exemplo.com/audio.mp3"
            aria-label="Link do áudio"
            className="w-full rounded-lg border-2 border-[#004687] p-3 text-[#004687] placeholder-[#004687]/40 focus:outline-none focus:ring-2 focus:ring-[#004687]"
          />
          <p className="mt-1 text-xs text-[#004687]/70">
            Cole o endereço de um áudio da internet (MP3, WAV, OGG...).
          </p>
        </div>
      )}
    </div>
  );
}
