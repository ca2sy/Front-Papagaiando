import { useEffect, useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";

export default function BotaoFala({ botao, onClick, perfilId }) {
  const [favoritado, setFavoritado] = useState(false);
  const chaveFavoritos = `favoritos:${perfilId}`;

  useEffect(() => {
    const favoritosSalvos =
      JSON.parse(localStorage.getItem(chaveFavoritos)) || [];

    const jaFavoritado = favoritosSalvos.some(
      (favorito) => favorito.id === botao.id
    );

    setFavoritado(jaFavoritado);
  }, [botao.id, chaveFavoritos]);

  const toggleFavorito = (e) => {
    e.stopPropagation();

    const favoritosSalvos =
      JSON.parse(localStorage.getItem(chaveFavoritos)) || [];

    let novosFavoritos;

    const jaFavoritado = favoritosSalvos.some(
      (favorito) => favorito.id === botao.id
    );

    if (jaFavoritado) {
      novosFavoritos = favoritosSalvos.filter(
        (favorito) => favorito.id !== botao.id
      );

      setFavoritado(false);
    } else {
      novosFavoritos = [...favoritosSalvos, botao];

      setFavoritado(true);
    }

    localStorage.setItem(
      chaveFavoritos,
      JSON.stringify(novosFavoritos)
    );

    window.dispatchEvent(new Event("favoritosAtualizados"));
  };

  return (
    <div
      className="flex flex-col items-center cursor-pointer group"
      onClick={() => onClick(botao)}
    >
      <div className="w-full aspect-square bg-white rounded-xl shadow-lg overflow-hidden border-2 border-transparent group-hover:border-blue-500 transition-all duration-300 hover:scale-105 hover:shadow-xl">
        <img
          src={botao.urlImagem}
          alt={botao.nome}
          className="w-full h-full object-contain p-2"
          onError={(e) => {
            e.target.src =
              "https://via.placeholder.com/200?text=📻";
          }}
        />
      </div>

      <div className="mt-3 flex items-center justify-between w-full">
        <h3 className="font-medium text-sm text-blue-900 truncate">
          {botao.nome}
        </h3>

        <button
          onClick={toggleFavorito}
          className="ml-2 text-pink-500 text-lg transition-transform hover:scale-110"
        >
          {favoritado ? <FaHeart /> : <FaRegHeart />}
        </button>
      </div>
    </div>
  );
}