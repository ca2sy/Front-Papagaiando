import { limparCache } from "./cache";

// Remove a sessão do usuário (token, cache e dados temporários).
export function sairDaConta() {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  sessionStorage.clear();
  limparCache();
}
