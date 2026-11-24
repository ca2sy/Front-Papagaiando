import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import { API_BASE_URL, getApiError } from "../../services/api";
import { aviso } from "../../components/Aviso";
import TelaCarregando, { Spinner } from "../../components/Carregando";
import BotaoVoltar from "../../components/BotaoVoltar";
import { useVoltar } from "../../services/navegacao";
import SenhaModal from "../../components/SenhaModal";
import { confirmar } from "../../components/confirmar";
import { sairDaConta } from "../../services/auth";

function cabecalhos() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };
}

export default function MinhaConta() {
  const navigate = useNavigate();
  const voltar = useVoltar("/meus-perfis");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  // "salvar" ou "excluir": qual ação está esperando a senha atual
  const [acaoPendente, setAcaoPendente] = useState(null);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/", { replace: true });
      return;
    }

    fetch(`${API_BASE_URL}/usuarios/me`, { headers: cabecalhos() })
      .then(async (res) => {
        if (res.status === 401) {
          sairDaConta();
          navigate("/", { replace: true });
          return null;
        }
        if (!res.ok) throw new Error(await getApiError(res));
        return res.json();
      })
      .then((dados) => {
        if (!dados) return;
        setNome(dados.nome ?? "");
        setEmail(dados.email ?? "");
      })
      .catch((err) => setErro(err.message))
      .finally(() => setLoading(false));
  }, [navigate]);

  const sair = () => {
    sairDaConta();
    navigate("/", { replace: true });
  };

  const pedirSenhaParaSalvar = (e) => {
    e.preventDefault();
    setErro("");

    if (senha && senha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    setAcaoPendente("salvar");
  };

  const salvar = async () => {
    setSalvando(true);
    setErro("");

    try {
      const dados = { nome: nome.trim(), email: email.trim() };
      if (senha) dados.senha = senha;

      const res = await fetch(`${API_BASE_URL}/usuarios/me`, {
        method: "PUT",
        headers: cabecalhos(),
        body: JSON.stringify(dados),
      });

      if (!res.ok) throw new Error(await getApiError(res));

      setSenha("");
      setConfirmarSenha("");
      aviso("Conta atualizada com sucesso!", "sucesso");
    } catch (err) {
      setErro(err.message);
    } finally {
      setSalvando(false);
    }
  };

  const pedirConfirmacaoExclusao = async () => {
    const ok = await confirmar({
      titulo: "Excluir sua conta?",
      mensagem:
        "Sua conta, todos os perfis, categorias e botões serão apagados para sempre. Essa ação não pode ser desfeita.",
      textoConfirmar: "Sim, excluir conta",
      perigo: true,
    });
    if (ok) setAcaoPendente("excluir");
  };

  const excluir = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/usuarios/me`, {
        method: "DELETE",
        headers: cabecalhos(),
      });

      if (!res.ok) throw new Error(await getApiError(res));

      sair();
    } catch (err) {
      setErro(err.message);
    }
  };

  const aoConfirmarSenha = () => {
    const acao = acaoPendente;
    setAcaoPendente(null);
    if (acao === "salvar") salvar();
    if (acao === "excluir") excluir();
  };

  if (loading) return <TelaCarregando texto="Carregando conta..." />;

  return (
    <main className="min-h-screen bg-[#b3daff] p-6">
      <div className="mx-auto max-w-md rounded-2xl bg-white p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between gap-2">
            <BotaoVoltar onClick={voltar} />
            <button
              type="button"
              onClick={sair}
              className="inline-flex items-center gap-2 rounded-full border-2 border-red-600 px-4 py-2 font-semibold text-red-600 hover:bg-red-50"
            >
              <FiLogOut size={20} aria-hidden="true" />
              Sair da conta
            </button>
          </div>
          <h1 className="mt-4 text-3xl font-extrabold text-center text-[#004687]">
            Minha Conta
          </h1>
        </div>

        <form onSubmit={pedirSenhaParaSalvar} className="space-y-4">
          <label className="block">
            Nome
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full rounded-lg border p-3"
              required
            />
          </label>

          <label className="block">
            E-mail
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border p-3"
              required
            />
          </label>

          <label className="block">
            Nova senha (opcional)
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              minLength={8}
              autoComplete="new-password"
              className="w-full rounded-lg border p-3"
            />
          </label>

          {senha && (
            <label className="block">
              Confirmar nova senha
              <input
                type="password"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                minLength={8}
                autoComplete="new-password"
                className="w-full rounded-lg border p-3"
                required
              />
            </label>
          )}

          {erro && (
            <p role="alert" className="text-red-600">
              {erro}
            </p>
          )}

          <button
            disabled={salvando}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#004687] p-3 text-white disabled:opacity-70"
          >
            {salvando && <Spinner tamanho={18} />}
            <span>{salvando ? "Salvando..." : "Salvar alterações"}</span>
          </button>
        </form>

        <button
          type="button"
          onClick={pedirConfirmacaoExclusao}
          className="mt-6 w-full text-red-600"
        >
          Excluir minha conta
        </button>
      </div>

      <SenhaModal
        isOpen={!!acaoPendente}
        titulo="Confirme sua senha"
        mensagem={
          acaoPendente === "excluir"
            ? "Digite sua senha atual para excluir a conta."
            : "Digite sua senha atual para salvar as alterações."
        }
        onClose={() => setAcaoPendente(null)}
        onConfirm={aoConfirmarSenha}
      />
    </main>
  );
}
