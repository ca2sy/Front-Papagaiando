import { useEffect, useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { SeloEditar } from "./ModoEdicao";
import {
  alternarFavorito,
  ehFavorito,
  ouvirFavoritos,
} from "../services/favoritos";

export default function BotaoFala({
  botao,
  onClick,
  perfilId,
  categoriaId,
  modoEdicao = false,
}) {
  const [favoritado, setFavoritado] = useState(() =>
    ehFavorito(perfilId, botao.id),
  );

  // Mantém o coração certo se o favorito mudar em outro lugar da tela
  useEffect(() => {
    const atualizar = () => setFavoritado(ehFavorito(perfilId, botao.id));
    atualizar();
    return ouvirFavoritos(atualizar);
  }, [perfilId, botao.id]);

  const toggleFavorito = (e) => {
    e.stopPropagation();
    setFavoritado(alternarFavorito(perfilId, botao, categoriaId));
  };

  return (
    <div
      className="flex flex-col items-center cursor-pointer group"
      onClick={() => onClick(botao)}
    >
      <div className="relative w-full aspect-square bg-white rounded-xl shadow-lg overflow-hidden border-2 border-transparent group-hover:border-blue-500 transition-all duration-300 hover:scale-105 hover:shadow-xl">
        <img
          src={botao.urlImagem}
          alt={botao.nome}
          className="w-full h-full object-contain p-2"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/200?text=📻";
          }}
        />
        {modoEdicao && <SeloEditar />}
      </div>

      <div className="mt-3 flex items-center justify-between w-full">
        <h3 className="font-medium text-sm text-blue-900 truncate">
          {botao.nome}
        </h3>

        {!modoEdicao && (
          <button
            type="button"
            onClick={toggleFavorito}
            aria-label={
              favoritado
                ? `Tirar ${botao.nome} dos favoritos`
                : `Favoritar ${botao.nome}`
            }
            aria-pressed={favoritado}
            className="ml-2 p-1 text-pink-500 text-lg transition-transform hover:scale-110"
          >
            {favoritado ? <FaHeart /> : <FaRegHeart />}
          </button>
        )}
      </div>
    </div>
  );
}
