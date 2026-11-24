// Favoritos de cada perfil, guardados no navegador (localStorage).
// TODO: mover para o back-end quando houver rota de favoritos.
//
// Cada favorito é uma cópia do botão + categoriaId. As funções de
// sincronização abaixo mantêm essa cópia igual ao botão real.

const EVENTO = "favoritosAtualizados";
const chave = (perfilId) => `favoritos:${perfilId}`;
const mesmoId = (a, b) => String(a) === String(b);

export function lerFavoritos(perfilId) {
  try {
    const salvos = JSON.parse(localStorage.getItem(chave(perfilId)) || "[]");
    return Array.isArray(salvos) ? salvos : [];
  } catch {
    return [];
  }
}

function salvarFavoritos(perfilId, lista) {
  try {
    localStorage.setItem(chave(perfilId), JSON.stringify(lista));
  } catch {
    // localStorage cheio ou bloqueado
  }
  window.dispatchEvent(new Event(EVENTO));
}

// Só grava (e avisa as telas) se algo mudou de verdade
function salvarSeMudou(perfilId, antes, depois) {
  if (JSON.stringify(antes) !== JSON.stringify(depois)) {
    salvarFavoritos(perfilId, depois);
  }
}

export function ouvirFavoritos(callback) {
  window.addEventListener(EVENTO, callback);
  return () => window.removeEventListener(EVENTO, callback);
}

export function ehFavorito(perfilId, botaoId) {
  return lerFavoritos(perfilId).some((f) => mesmoId(f.id, botaoId));
}

// Adiciona ou remove. Devolve true se ficou favoritado.
export function alternarFavorito(perfilId, botao, categoriaId) {
  const lista = lerFavoritos(perfilId);

  if (lista.some((f) => mesmoId(f.id, botao.id))) {
    salvarFavoritos(perfilId, lista.filter((f) => !mesmoId(f.id, botao.id)));
    return false;
  }

  salvarFavoritos(perfilId, [
    ...lista,
    { ...botao, categoriaId: botao.categoriaId ?? categoriaId ?? null },
  ]);
  return true;
}

// Botão editado: atualiza nome/imagem/áudio do favorito
export function atualizarFavorito(perfilId, botaoId, dados) {
  const antes = lerFavoritos(perfilId);
  const depois = antes.map((f) => (mesmoId(f.id, botaoId) ? { ...f, ...dados } : f));
  salvarSeMudou(perfilId, antes, depois);
}

// Botão excluído
export function removerFavorito(perfilId, botaoId) {
  const antes = lerFavoritos(perfilId);
  salvarSeMudou(perfilId, antes, antes.filter((f) => !mesmoId(f.id, botaoId)));
}

// Ao carregar os botões de uma categoria: atualiza os favoritos dela com os
// dados do servidor e tira os que não existem mais.
export function sincronizarFavoritosDaCategoria(perfilId, categoriaId, botoes) {
  const antes = lerFavoritos(perfilId);
  const porId = new Map(botoes.map((b) => [String(b.id), b]));

  const depois = antes
    .map((f) => {
      const atual = porId.get(String(f.id));
      if (atual) return { ...f, ...atual, categoriaId: atual.categoriaId ?? categoriaId };
      return f;
    })
    .filter((f) => porId.has(String(f.id)) || !mesmoId(f.categoriaId, categoriaId));

  salvarSeMudou(perfilId, antes, depois);
}

// Ao carregar as categorias: tira favoritos de categorias que foram excluídas.
export function sincronizarFavoritosDasCategorias(perfilId, categorias) {
  const ids = new Set(categorias.map((c) => String(c.id)));
  const antes = lerFavoritos(perfilId);
  const depois = antes.filter((f) => f.categoriaId == null || ids.has(String(f.categoriaId)));
  salvarSeMudou(perfilId, antes, depois);
}

// Perfil excluído: apaga todos os favoritos dele
export function apagarFavoritosDoPerfil(perfilId) {
  try {
    localStorage.removeItem(chave(perfilId));
  } catch {
    // ignora
  }
}
