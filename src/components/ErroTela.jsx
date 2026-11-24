import { Component } from "react";
import { sairDaConta } from "../services/auth";

// Captura erros de renderização para não deixar a tela em branco.
export default class ErroTela extends Component {
  state = { erro: null };

  static getDerivedStateFromError(erro) {
    return { erro };
  }

  componentDidCatch(erro, info) {
    console.error("Erro na tela:", erro, info);
  }

  render() {
    if (!this.state.erro) return this.props.children;

    return (
      <div className="min-h-screen bg-[#b3daff] flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-2xl">
          <h1 className="mb-2 text-2xl font-bold text-[#004687]">
            Algo deu errado
          </h1>
          <p className="mb-4 text-gray-600">
            Não foi possível mostrar esta tela.
          </p>
          <p className="mb-5 break-words rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {String(this.state.erro?.message || this.state.erro)}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="flex-1 rounded-lg bg-[#004687] px-4 py-3 font-semibold text-white hover:bg-[#003366]"
            >
              Tentar de novo
            </button>
            <button
              type="button"
              onClick={() => {
                sairDaConta();
                window.location.href = "/";
              }}
              className="flex-1 rounded-lg border-2 border-[#004687] px-4 py-3 font-semibold text-[#004687] hover:bg-blue-50"
            >
              Voltar ao login
            </button>
          </div>
        </div>
      </div>
    );
  }
}
