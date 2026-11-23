// Cache simples no localStorage: as telas mostram na hora o que já foi
// carregado antes e atualizam com o servidor em segundo plano.
const PREFIXO = "cache:";

export function lerCache(chave) {
  try {
    const valor = localStorage.getItem(PREFIXO + chave);
    return valor ? JSON.parse(valor) : null;
  } catch {
    return null;
  }
}

export function salvarCache(chave, dados) {
  try {
    localStorage.setItem(PREFIXO + chave, JSON.stringify(dados));
  } catch {
    // localStorage cheio ou bloqueado: segue sem cache
  }
}

// Chamado ao entrar/sair da conta para não misturar dados de usuários.
export function limparCache() {
  try {
    Object.keys(localStorage)
      .filter((chave) => chave.startsWith(PREFIXO))
      .forEach((chave) => localStorage.removeItem(chave));
  } catch {
    // ignora
  }
}
