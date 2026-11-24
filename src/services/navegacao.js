import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Volta para a tela de onde a pessoa veio.
// Se a página foi aberta direto (sem tela anterior no site), vai para `destinoPadrao`.
export function useVoltar(destinoPadrao) {
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback(() => {
    if (location.key !== "default") {
      navigate(-1);
    } else {
      navigate(destinoPadrao, { replace: true });
    }
  }, [navigate, location.key, destinoPadrao]);
}

// Modo edição da tela atual. Fica guardado no histórico, então ao voltar de
// "Editar categoria"/"Editar botão" a tela continua em modo edição.
export function useModoEdicao() {
  const navigate = useNavigate();
  const location = useLocation();
  const editando = location.state?.editando === true;

  const setEditando = useCallback(
    (valor) => {
      navigate(location.pathname + location.search, {
        replace: true,
        state: { ...location.state, editando: valor },
      });
    },
    [navigate, location.pathname, location.search, location.state]
  );

  return [editando, setEditando];
}
