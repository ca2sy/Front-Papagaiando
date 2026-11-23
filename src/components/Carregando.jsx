import papagaiandoImg from "../assets/papagaiando.jpg";

// Círculo de carregamento. Herda a cor do texto (currentColor).
export function Spinner({ tamanho = 20, className = "" }) {
  return (
    <span
      role="status"
      aria-label="Carregando"
      className={`inline-block shrink-0 animate-spin rounded-full border-[3px] border-current border-t-transparent ${className}`}
      style={{ width: tamanho, height: tamanho }}
    />
  );
}

// Tela inteira de carregamento, usada enquanto a página busca os dados.
export default function TelaCarregando({ texto = "Carregando..." }) {
  return (
    <div className="min-h-screen bg-[#b3daff] flex flex-col items-center justify-center gap-6 p-4">
      <div className="relative w-28 h-28 flex items-center justify-center">
        <Spinner tamanho={112} className="absolute inset-0 text-[#004687]" />
        <img
          src={papagaiandoImg}
          alt=""
          className="w-20 h-20 rounded-full object-cover"
        />
      </div>
      <p className="text-lg font-semibold text-[#004687]">{texto}</p>
    </div>
  );
}
