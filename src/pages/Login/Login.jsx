import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { API_BASE_URL, getApiError } from "../../services/api";
import { aviso } from "../../components/Aviso";
import { limparCache } from "../../services/cache";
import { Spinner } from "../../components/Carregando";
import {
  classeRotulo,
  classeCampo,
  classeBotaoPrincipal,
  classeLink,
} from "../../components/TelaAcesso";

export default function Login() {
  const [form, setForm] = useState({ email: "", senha: "" });
  const [enviando, setEnviando] = useState(false);
  const navigate = useNavigate();

  // Já está logado: vai direto para os perfis
  if (localStorage.getItem("token")) {
    return <Navigate to="/meus-perfis" replace />;
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (enviando) return;
    setEnviando(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const mensagem = await getApiError(response, "Erro ao fazer login.");
        aviso(mensagem, "erro");
        return;
      }

      const data = await response.json();
      limparCache();
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId);
      aviso(`Bem-vindo, ${data.nome}!`, "sucesso");

      navigate("/meus-perfis", { replace: true });
    } catch (err) {
      console.error("Erro na requisição:", err);
      aviso("Erro de conexão com o servidor", "erro");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      <h1 className="text-2xl font-semibold text-[#1f3f80]">Entrar</h1>
      <p className="mb-6 text-[#1f3f80]/70">
        Que bom te ver de novo! Entre com sua conta.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="login-email" className={classeRotulo}>
            E-mail
          </label>
          <input
            id="login-email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            className={classeCampo}
            placeholder="exemplo@email.com"
            required
          />
        </div>

        <div>
          <label htmlFor="login-senha" className={classeRotulo}>
            Senha
          </label>
          <input
            id="login-senha"
            type="password"
            name="senha"
            value={form.senha}
            onChange={handleChange}
            autoComplete="current-password"
            className={classeCampo}
            placeholder="Sua senha"
            required
          />
        </div>

        <button
          type="submit"
          disabled={enviando}
          className={`${classeBotaoPrincipal} mt-2`}
        >
          {enviando && <Spinner tamanho={20} />}
          <span>{enviando ? "Entrando..." : "Entrar"}</span>
        </button>
      </form>

      <p className="mt-6 text-center text-[#1f3f80]/80">
        Ainda não tem uma conta?{" "}
        <Link to="/cadastro" replace className={classeLink}>
          Cadastre-se
        </Link>
      </p>
    </>
  );
}
