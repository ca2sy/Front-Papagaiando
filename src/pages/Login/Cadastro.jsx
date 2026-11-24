import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_BASE_URL, getApiError } from "../../services/api";
import { aviso } from "../../components/Aviso";
import { Spinner } from "../../components/Carregando";
import {
  classeRotulo,
  classeCampo,
  classeBotaoPrincipal,
  classeLink,
} from "../../components/TelaAcesso";

export default function Cadastro() {
  const [form, setForm] = useState({
    nome: "",
    sobrenome: "",
    email: "",
    senha: "",
  });

  const [enviando, setEnviando] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.senha.length < 8) {
      aviso("A senha deve ter pelo menos 8 caracteres.", "erro");
      return;
    }

    const payload = {
      nome: `${form.nome.trim()} ${form.sobrenome.trim()}`,
      email: form.email.trim(),
      senha: form.senha,
    };

    if (enviando) return;
    setEnviando(true);

    try {
      const response = await fetch(`${API_BASE_URL}/usuarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        aviso("Cadastro realizado com sucesso! Agora é só entrar.", "sucesso");
        navigate("/", { replace: true });
      } else {
        const mensagem = await getApiError(
          response,
          "Não foi possível realizar o cadastro.",
        );
        aviso("Erro ao cadastrar: " + mensagem, "erro");
      }
    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      aviso("Não foi possível realizar o cadastro. Tente novamente.", "erro");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      <h1 className="text-2xl font-semibold text-[#1f3f80]">Criar conta</h1>
      <p className="mb-6 text-[#1f3f80]/70">
        Leva menos de um minuto para começar.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="cad-nome" className={classeRotulo}>
              Nome
            </label>
            <input
              id="cad-nome"
              type="text"
              name="nome"
              value={form.nome}
              onChange={handleChange}
              autoComplete="given-name"
              className={classeCampo}
              placeholder="Seu nome"
              required
            />
          </div>

          <div>
            <label htmlFor="cad-sobrenome" className={classeRotulo}>
              Sobrenome
            </label>
            <input
              id="cad-sobrenome"
              type="text"
              name="sobrenome"
              value={form.sobrenome}
              onChange={handleChange}
              autoComplete="family-name"
              className={classeCampo}
              placeholder="Seu sobrenome"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="cad-email" className={classeRotulo}>
            E-mail
          </label>
          <input
            id="cad-email"
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
          <label htmlFor="cad-senha" className={classeRotulo}>
            Senha
          </label>
          <input
            id="cad-senha"
            type="password"
            name="senha"
            value={form.senha}
            onChange={handleChange}
            autoComplete="new-password"
            minLength={8}
            aria-describedby="cad-senha-dica"
            className={classeCampo}
            placeholder="Crie uma senha"
            required
          />
          <p id="cad-senha-dica" className="mt-1 text-xs text-[#1f3f80]/60">
            Mínimo de 8 caracteres
          </p>
        </div>

        <button
          type="submit"
          disabled={enviando}
          className={`${classeBotaoPrincipal} mt-2`}
        >
          {enviando && <Spinner tamanho={18} />}
          <span>{enviando ? "Cadastrando..." : "Cadastrar"}</span>
        </button>
      </form>

      <p className="mt-6 text-center text-[#1f3f80]/80">
        Já tem uma conta?{" "}
        <Link to="/" replace className={classeLink}>
          Faça login
        </Link>
      </p>
    </>
  );
}
