import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiLogOut, FiUser, FiShield } from "react-icons/fi";
import { API_BASE_URL, getApiError } from "../../services/api";
import { aviso } from "../../components/Aviso";
import TelaCarregando, { Spinner } from "../../components/Carregando";
import BotaoVoltar from "../../components/BotaoVoltar";
import { useVoltar } from "../../services/navegacao";
import SenhaModal from "../../components/SenhaModal";
import { confirmar } from "../../components/confirmar";
import { sairDaConta } from "../../services/auth";
import papagaiandoImg from "../../assets/papagaiando.jpg";

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
    <div className="min-h-screen bg-[#F8F5F3]">
      <header className="bg-[#365FB3] text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 sm:px-8">
          <div className="flex items-center gap-3">
            <img
              src={papagaiandoImg}
              alt=""
              className="h-11 w-11 rounded-xl object-cover"
            />
            <span className="text-xl font-bold">Papagaiando</span>
          </div>
          <span className="text-sm font-medium">Área do responsável</span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-5 pb-12 pt-8 sm:px-8 sm:pt-10">
        <button
          type="button"
          onClick={voltar}
          className="mb-5 text-sm font-semibold text-[#365FB3] hover:underline"
        >
          ‹ Voltar
        </button>

        <h1 className="mb-2 text-3xl font-bold text-[#1F3F80] sm:text-4xl">
          Minha conta
        </h1>

        <p className="mb-8 text-[#617A98]">
          Gerencie suas informações pessoais e a segurança da sua conta.
        </p>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,1fr)]">
          <form
            onSubmit={pedirSenhaParaSalvar}
            className="flex flex-col rounded-3xl bg-white p-6 sm:p-8"
          >
            <div className="mb-7 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#CFE5F5] text-[#365FB3]">
                <FiUser size={22} aria-hidden="true" />
              </div>
              <h2 className="text-xl font-bold text-[#1F3F80]">
                Dados pessoais
              </h2>
            </div>

            <div>
              <label
                htmlFor="nome-conta"
                className="mb-2 block font-semibold text-[#1F3F80]"
              >
                Nome
              </label>
              <input
                id="nome-conta"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                disabled={salvando}
                autoComplete="name"
                required
                className="w-full rounded-xl border border-[#A8BED6] bg-white px-4 py-3 text-[#1F3F80] outline-none focus:border-[#365FB3] focus:ring-2 focus:ring-[#365FB3]/20"
              />
            </div>

            <div className="mt-6">
              <label
                htmlFor="email-conta"
                className="mb-2 block font-semibold text-[#1F3F80]"
              >
                E-mail
              </label>
              <input
                id="email-conta"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={salvando}
                autoComplete="email"
                required
                className="w-full rounded-xl border border-[#A8BED6] bg-white px-4 py-3 text-[#1F3F80] outline-none focus:border-[#365FB3] focus:ring-2 focus:ring-[#365FB3]/20"
              />
            </div>

            <div className="mt-7 border-t border-[#E2E8F0] pt-6">
              <h3 className="mb-2 text-lg font-bold text-[#1F3F80]">
                Alterar senha
              </h3>
              <p className="mb-5 text-sm text-[#617A98]">
                Deixe em branco caso não queira alterar sua senha.
              </p>

              <label
                htmlFor="nova-senha"
                className="mb-2 block font-semibold text-[#1F3F80]"
              >
                Nova senha (opcional)
              </label>
              <input
                id="nova-senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                disabled={salvando}
                minLength={8}
                autoComplete="new-password"
                placeholder="Mínimo de 8 caracteres"
                className="w-full rounded-xl border border-[#A8BED6] bg-white px-4 py-3 text-[#1F3F80] outline-none focus:border-[#365FB3] focus:ring-2 focus:ring-[#365FB3]/20"
              />

              {senha && (
                <div className="mt-5">
                  <label
                    htmlFor="confirmar-senha"
                    className="mb-2 block font-semibold text-[#1F3F80]"
                  >
                    Confirmar nova senha
                  </label>
                  <input
                    id="confirmar-senha"
                    type="password"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    disabled={salvando}
                    minLength={8}
                    autoComplete="new-password"
                    required
                    className="w-full rounded-xl border border-[#A8BED6] bg-white px-4 py-3 text-[#1F3F80] outline-none focus:border-[#365FB3] focus:ring-2 focus:ring-[#365FB3]/20"
                  />
                </div>
              )}
            </div>

            {erro && (
              <p
                role="alert"
                className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {erro}
              </p>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={salvando}
                className="flex min-w-[190px] items-center justify-center gap-2 rounded-xl bg-[#365FB3] px-6 py-3 font-semibold text-white transition hover:bg-[#1F3F80] disabled:opacity-60"
              >
                {salvando && <Spinner tamanho={18} />}
                {salvando ? "Salvando..." : "Salvar alterações"}
              </button>

              <button
                type="button"
                onClick={voltar}
                disabled={salvando}
                className="rounded-xl border border-[#A8BED6] bg-white px-6 py-3 font-semibold text-[#365FB3] transition hover:bg-[#F8F5F3] disabled:opacity-60"
              >
                Cancelar
              </button>
            </div>
          </form>

          <aside className="h-fit rounded-3xl bg-[#CFE5F5] p-6 sm:p-8">
            <div className="mb-4 flex items-center gap-3">
              <FiShield size={24} className="text-[#365FB3]" />
              <h2 className="text-xl font-bold text-[#1F3F80]">
                Segurança e conta
              </h2>
            </div>

            <p className="text-sm leading-relaxed text-[#1F3F80]">
              Para proteger sua conta, solicitaremos sua senha atual antes de
              salvar alterações importantes.
            </p>

            <div className="my-6 border-t border-[#A8BED6]" />

            <button
              type="button"
              onClick={sair}
              className="flex w-full items-center gap-3 rounded-xl border border-[#A8BED6] bg-white px-4 py-3 font-semibold text-[#365FB3] transition hover:bg-[#F8F5F3]"
            >
              <FiLogOut size={20} aria-hidden="true" />
              Sair da conta
            </button>

            <div className="my-6 border-t border-[#A8BED6]" />

            <h3 className="mb-2 font-bold text-[#1F3F80]">Excluir conta</h3>

            <p className="mb-4 text-sm leading-relaxed text-[#1F3F80]">
              Esta ação excluirá permanentemente sua conta e todos os perfis,
              categorias e botões associados a ela.
            </p>

            <button
              type="button"
              onClick={pedirConfirmacaoExclusao}
              className="w-full rounded-xl border border-red-300 bg-white px-4 py-3 font-semibold text-red-700 transition hover:bg-red-50"
            >
              Excluir minha conta
            </button>
          </aside>
        </div>
      </main>

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
    </div>
  );
}
