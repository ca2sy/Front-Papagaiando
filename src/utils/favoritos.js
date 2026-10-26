export function lerFavoritos() {
  return JSON.parse(localStorage.getItem("favoritos")) || [];
}

export function atualizarFavorito(botao) {
  const favoritos = lerFavoritos();

  if (!favoritos.some((favorito) => favorito.id === botao.id)) return;

  localStorage.setItem(
    "favoritos",
    JSON.stringify(
      favoritos.map((favorito) => (favorito.id === botao.id ? botao : favorito))
    )
  );
}

export function removerFavorito(botaoId) {
  localStorage.setItem(
    "favoritos",
    JSON.stringify(lerFavoritos().filter((favorito) => favorito.id !== botaoId))
  );
}
