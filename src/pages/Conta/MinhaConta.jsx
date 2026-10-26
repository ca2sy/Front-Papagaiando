import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SenhaModal from "../../components/SenhaModal.jsx";
import api, { mensagemDeErro } from "../../services/api";

export default function MinhaConta() {
  const [usuario, setUsuario] = useState(null);
  const [form, setForm] = useState({ nome: "", email: "", senha: "" });
  const [carregando, setCarregando] = useState(true);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [showSenhaModal, setShowSenhaModal] = useState(false);
  const [acaoSelecionada, setAcaoSelecionada] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const buscarUsuario = async () => {
      if (!localStorage.getItem("token")) {
        navigate("/");
        return;
      }

      try {
        const { data } = await api.get("/usuarios/me");
        setUsuario(data);
        setForm({ nome: data.nome, email: data.email, senha: "" });
      } catch (error) {
        console.error("Erro ao carregar conta:", error);
        setErro(mensagemDeErro(error, "Erro ao carregar os dados da conta"));
      } finally {
        setCarregando(false);
      }
    };

    buscarUsuario();
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const pedirSenha = (acao) => {
    setAcaoSelecionada(acao);
    setShowSenhaModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (form.senha && form.senha.length < 8) {
      setErro("A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }

    setErro("");
    pedirSenha("salvar");
  };

  const salvar = async () => {
    const payload = {};

    if (form.nome !== usuario.nome) payload.nome = form.nome;
    if (form.email !== usuario.email) payload.email = form.email;
    if (form.senha) payload.senha = form.senha;

    if (Object.keys(payload).length === 0) {
      setErro("Nenhuma alteração para salvar.");
      return;
    }

    setLoading(true);
    setErro("");

    try {
      const { data } = await api.put("/usuarios/me", payload);
      setUsuario(data);
      setForm({ nome: data.nome, email: data.email, senha: "" });
      alert("Conta atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar conta:", error);
      setErro(mensagemDeErro(error, "Erro ao atualizar conta. Tente novamente."));
    } finally {
      setLoading(false);
    }
  };

  const excluir = async () => {
    setLoading(true);
    setErro("");

    try {
      await api.delete("/usuarios/me");
      localStorage.clear();
      alert("Conta excluída com sucesso.");
      navigate("/");
    } catch (error) {
      console.error("Erro ao excluir conta:", error);
      setErro(mensagemDeErro(error, "Erro ao excluir conta. Tente novamente."));
      setLoading(false);
    }
  };

  const handleSenhaConfirmada = () => {
    setShowSenhaModal(false);

    if (acaoSelecionada === "salvar") {
      salvar();
    } else if (acaoSelecionada === "excluir") {
      excluir();
    }
  };

  if (carregando) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#b3daff]">
        <p className="text-xl text-[#004687]">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#b3daff] p-4">
      <div className="bg-[#ffffff] backdrop-blur-md p-8 md:p-12 rounded-3xl shadow-2xl w-full max-w-md text-[#004687] border-2 border-[#004687]/30">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate("/meus-perfis")}
            className="text-[#004687] hover:text-blue-100 mr-4"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-3xl font-extrabold">Minha Conta</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-[#004687]">
              Nome
            </label>
            <input
              type="text"
              name="nome"
              value={form.nome}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg text-[#004687] placeholder-[#004687] focus:outline-none focus:ring-2 focus:ring-[#004687] border border-[#004687] bg-white text-sm"
              placeholder="Digite seu nome"
              disabled={loading || !usuario}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-[#004687]">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg text-[#004687] placeholder-[#004687] focus:outline-none focus:ring-2 focus:ring-[#004687] border border-[#004687] bg-white text-sm"
              placeholder="exemplo@email.com"
              disabled={loading || !usuario}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-[#004687]">
              Nova senha
            </label>
            <input
              type="password"
              name="senha"
              value={form.senha}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg text-[#004687] placeholder-[#004687] focus:outline-none focus:ring-2 focus:ring-[#004687] border border-[#004687] bg-white text-sm"
              placeholder="Deixe em branco para manter a atual"
              disabled={loading || !usuario}
            />
            <p className="text-xs text-[#004687] mt-1">
              Mínimo de 8 caracteres
            </p>
          </div>

          {erro && (
            <div className="bg-red-500/20 border border-red-400 text-[#004687] px-4 py-3 rounded-lg text-sm">
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !usuario}
            className="w-full bg-[#004687] hover:bg-[#003366] transition font-semibold py-3 rounded-lg shadow-lg mt-4 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Salvando..." : "Salvar Alterações"}
          </button>
        </form>

        <button
          onClick={() => pedirSenha("excluir")}
          disabled={loading || !usuario}
          className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-center font-medium mt-4 rounded-lg"
        >
          Excluir Conta
        </button>
      </div>

      <SenhaModal
        isOpen={showSenhaModal}
        onClose={() => setShowSenhaModal(false)}
        onConfirm={handleSenhaConfirmada}
        titulo={acaoSelecionada === "excluir" ? "Excluir conta" : "Confirmar ação"}
        mensagem={
          acaoSelecionada === "excluir"
            ? "Essa ação não pode ser desfeita. Digite sua senha para excluir a conta:"
            : "Por favor, digite sua senha para continuar:"
        }
      />
    </div>
  );
}
