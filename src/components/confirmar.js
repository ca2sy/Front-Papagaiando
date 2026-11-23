let ouvinte = null;

// Substitui o window.confirm(): abre o ConfirmModal e devolve true/false.
// Ex.: if (!(await confirmar({ titulo, mensagem, textoConfirmar, perigo }))) return;
export function confirmar(opcoes) {
  return new Promise((resolver) => {
    if (!ouvinte) return resolver(window.confirm(opcoes.mensagem));
    ouvinte({ opcoes, resolver });
  });
}

export function registrarOuvinteConfirmacao(fn) {
  ouvinte = fn;
  return () => {
    if (ouvinte === fn) ouvinte = null;
  };
}
