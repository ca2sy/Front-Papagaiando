
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, getApiError } from "../../services/api";
import { aviso } from "../../components/Aviso";
import TelaCarregando, { Spinner } from "../../components/Carregando";
import BotaoVoltar from "../../components/BotaoVoltar";
import { confirmar } from "../../components/confirmar";

export default function MinhaConta() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    fetch(`${API_BASE_URL}/usuarios/me`, { headers })
      .then(async (res) => {
        if (!res.ok) throw new Error(await getApiError(res));
        return res.json();
      })
      .then((dados) => {
        setNome(dados.nome);
        setEmail(dados.email);
      })
      .catch((err) => setErro(err.message))
      .finally(() => setLoading(false));
  }, [navigate, token]);

  const salvar = async (e) => {
    e.preventDefault();
    setSalvando(true);
    setErro("");

    try {
      const dados = { nome: nome.trim(), email: email.trim() };
      if (senha) dados.senha = senha;

      const res = await fetch(`${API_BASE_URL}/usuarios/me`, {
        method: "PUT",
        headers,
        body: JSON.stringify(dados),
      });

      if (!res.ok) throw new Error(await getApiError(res));

      setSenha("");
      aviso("Conta atualizada com sucesso!", "sucesso");
    } catch (err) {
      setErro(err.message);
    } finally {
      setSalvando(false);
    }
  };

  const excluir = async () => {
    const ok = await confirmar({
      titulo: "Excluir sua conta?",
      mensagem:
        "Sua conta, todos os perfis, categorias e botões serão apagados para sempre. Essa ação não pode ser desfeita.",
      textoConfirmar: "Sim, excluir conta",
      perigo: true,
    });
    if (!ok) return;

    try {
      const res = await fetch(`${API_BASE_URL}/usuarios/me`, {
        method: "DELETE",
        headers,
      });

      if (!res.ok) throw new Error(await getApiError(res));

      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      navigate("/");
    } catch (err) {
      setErro(err.message);
    }
  };

  if (loading) return <TelaCarregando texto="Carregando conta..." />;

  return (
    <main className="min-h-screen bg-[#b3daff] p-6">
      <div className="mx-auto max-w-md rounded-2xl bg-white p-6">
        <div className="mb-6">
            <BotaoVoltar onClick={() => navigate("/meus-perfis")} />
            <h1 className="mt-4 text-3xl font-extrabold text-center text-[#004687]">Minha Conta</h1>
          </div>

        <form onSubmit={salvar} className="space-y-4">
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
              className="w-full rounded-lg border p-3"
            />
          </label>

          {erro && <p role="alert" className="text-red-600">{erro}</p>}

          <button
            disabled={salvando}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#004687] p-3 text-white disabled:opacity-70"
          >
            {salvando && <Spinner tamanho={18} />}
            {salvando ? "Salvando..." : "Salvar alterações"}
          </button>
        </form>

        <button
          onClick={excluir}
          className="mt-6 w-full text-red-600"
        >
          Excluir minha conta
        </button>
      </div>
    </main>
  );
}