// Título de página/seção: título em degradê + subtítulo opcional.
export default function TituloSecao({
  titulo,
  subtitulo,
  como = "h2",
  className = "",
}) {
  const Tag = como;

  return (
    <div className={`mb-5 min-w-0 ${className}`}>
      <Tag className="truncate bg-gradient-to-r from-[#003366] via-[#004687] to-[#2f7fd1] bg-clip-text pb-0.5 text-2xl sm:text-3xl font-extrabold tracking-tight text-transparent">
        {titulo}
      </Tag>
      {subtitulo && <p className="text-sm text-[#004687]/75">{subtitulo}</p>}
    </div>
  );
}
