import { useEffect, useId, useState } from "react";
import { FiUploadCloud, FiLink, FiImage } from "react-icons/fi";

const TAMANHO_MAXIMO = 5 * 1024 * 1024;

// Escolha de imagem: enviar um arquivo do computador/celular ou colar um link.
// O pai guarda `url` (link) e `arquivo` (File); se houver arquivo, ele tem prioridade.
export default function CampoImagem({
  rotulo = "Imagem",
  url,
  onUrlChange,
  arquivo,
  onArquivoChange,
  onErro,
  disabled = false,
}) {
  const id = useId();
  const [modo, setModo] = useState("arquivo");
  const [previewArquivo, setPreviewArquivo] = useState(null);
  const [linkQuebrado, setLinkQuebrado] = useState(false);

  useEffect(() => {
    if (!arquivo) {
      setPreviewArquivo(null);
      return;
    }
    const objeto = URL.createObjectURL(arquivo);
    setPreviewArquivo(objeto);
    return () => URL.revokeObjectURL(objeto);
  }, [arquivo]);

  const preview = previewArquivo || url;

  const escolherArquivo = (e) => {
    const novo = e.target.files?.[0];
    e.target.value = "";
    if (!novo) return;

    if (!novo.type.startsWith("image/")) {
      onErro?.("Escolha um arquivo de imagem (PNG, JPG ou GIF).");
      return;
    }
    if (novo.size > TAMANHO_MAXIMO) {
      onErro?.("A imagem não pode ser maior que 5MB.");
      return;
    }
    onErro?.("");
    onArquivoChange(novo);
  };

  const abaClasse = (ativa) =>
    `flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
      ativa ? "bg-white text-[#004687] shadow" : "text-[#004687]/70 hover:text-[#004687]"
    }`;

  return (
    <div>
      <p className="block text-[#004687] font-medium mb-2">{rotulo}</p>

      {/* Prévia da imagem que será salva */}
      <div className="mb-3 flex h-36 items-center justify-center rounded-xl border-2 border-dashed border-[#004687]/30 bg-[#b3daff]/20 p-2">
        {preview && !(linkQuebrado && !previewArquivo) ? (
          <img
            src={preview}
            alt="Prévia"
            onError={() => setLinkQuebrado(true)}
            onLoad={() => setLinkQuebrado(false)}
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="text-center text-[#004687]/60">
            <FiImage size={32} className="mx-auto mb-1" />
            <p className="text-sm">
              {linkQuebrado ? "Não foi possível abrir esse link" : "Nenhuma imagem escolhida"}
            </p>
          </div>
        )}
      </div>

      <div role="tablist" className="mb-3 flex gap-1 rounded-xl bg-[#b3daff]/40 p-1">
        <button
          type="button"
          role="tab"
          aria-selected={modo === "arquivo"}
          onClick={() => setModo("arquivo")}
          disabled={disabled}
          className={abaClasse(modo === "arquivo")}
        >
          <FiUploadCloud size={18} /> Enviar imagem
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={modo === "link"}
          onClick={() => setModo("link")}
          disabled={disabled}
          className={abaClasse(modo === "link")}
        >
          <FiLink size={18} /> Colar link
        </button>
      </div>

      {modo === "arquivo" ? (
        <div>
          <input
            id={id}
            type="file"
            accept="image/*"
            onChange={escolherArquivo}
            disabled={disabled}
            className="hidden"
          />
          <label
            htmlFor={id}
            className={`flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-[#004687] px-4 py-4 text-center text-[#004687] transition hover:bg-blue-50 ${
              disabled ? "pointer-events-none opacity-50" : ""
            }`}
          >
            <FiUploadCloud size={26} />
            <span className="font-semibold">
              {arquivo ? "Trocar imagem" : "Escolher imagem do aparelho"}
            </span>
            <span className="text-xs text-[#004687]/70">
              {arquivo ? arquivo.name : "PNG, JPG ou GIF até 5MB"}
            </span>
          </label>
          {arquivo && (
            <button
              type="button"
              onClick={() => onArquivoChange(null)}
              disabled={disabled}
              className="mt-2 w-full text-sm font-semibold text-red-600 hover:underline"
            >
              Desfazer e manter a imagem anterior
            </button>
          )}
        </div>
      ) : (
        <div>
          <input
            type="url"
            value={url}
            onChange={(e) => {
              onArquivoChange(null);
              setLinkQuebrado(false);
              onUrlChange(e.target.value);
            }}
            disabled={disabled}
            placeholder="https://exemplo.com/imagem.png"
            aria-label="Link da imagem"
            className="w-full rounded-lg border-2 border-[#004687] p-3 text-[#004687] placeholder-[#004687]/40 focus:outline-none focus:ring-2 focus:ring-[#004687]"
          />
          <p className="mt-1 text-xs text-[#004687]/70">
            Cole o endereço de uma imagem da internet.
          </p>
        </div>
      )}
    </div>
  );
}
