let ouvinte = null;
let proximoId = 0;

// Substitui o alert(): mostra um aviso no meio da tela que some sozinho.
// tipo: "sucesso" | "erro" | "info"
export function aviso(mensagem, tipo = "info") {
  ouvinte?.({ id: ++proximoId, mensagem, tipo });
}

export function registrarOuvinteAviso(fn) {
  ouvinte = fn;
  return () => {
    if (ouvinte === fn) ouvinte = null;
  };
}
