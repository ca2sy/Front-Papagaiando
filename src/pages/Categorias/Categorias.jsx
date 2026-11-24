import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import HeaderPerfil from "../../components/HeaderPerfil.jsx";
import SenhaModal from "../../components/SenhaModal.jsx";
import BotaoFala from "../../components/BotaoFala.jsx";
import { API_BASE_URL, getApiError } from "../../services/api";
import { aviso } from "../../components/Aviso";
import TituloSecao from "../../components/TituloSecao";
import { lerCache, salvarCache } from "../../services/cache";
import TelaCarregando from "../../components/Carregando";
import ConfirmModal from "../../components/ConfirmModal";
import { confirmar } from "../../components/confirmar";
import { useModoEdicao } from "../../services/navegacao";
import {
  lerFavoritos,
  ouvirFavoritos,
  sincronizarFavoritosDasCategorias,
} from "../../services/favoritos";
import {
  BarraEdicao,
  SeloEditar,
  AcaoExcluir,
  AcaoRestaurar,
} from "../../components/ModoEdicao";

export default function CategoriasPage() {
  const { perfilId } = useParams();
  const chaveCategorias = `categorias:${perfilId}`;
  const chavePerfil = `perfil:${perfilId}`;

  // Mostra na hora o que já estava salvo e atualiza em segundo plano
  const [categorias, setCategorias] = useState(() => lerCache(chaveCategorias) || []);
  const [favoritos, setFavoritos] = useState(() => lerFavoritos(perfilId));
  const [loading, setLoading] = useState(() => !lerCache(chaveCategorias));
  const [perfil, setPerfil] = useState(() => lerCache(chavePerfil));
  const [showSenhaModal, setShowSenhaModal] = useState(false);
  const [acaoSelecionada, setAcaoSelecionada] = useState(null);
  const [categoriaParaExcluir, setCategoriaParaExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExclusao, setErroExclusao] = useState("");

  const navigate = useNavigate();
  const [editando, setEditando] = useModoEdicao();

  const carregarCategorias = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token || !perfilId) {
      setLoading(false);
      navigate(!token ? "/" : "/meus-perfis", { replace: true });
      return;
    }

    const headers = { Authorization: "Bearer " + token };

    try {
      // Perfil e categorias são buscados ao mesmo tempo
      const [perfilResponse, categoriasResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/perfis/${perfilId}`, { headers }),
        fetch(`${API_BASE_URL}/categorias/perfil/${perfilId}`, { headers }),
      ]);

      if (perfilResponse.ok) {
        const perfilData = await perfilResponse.json();
        setPerfil(perfilData);
        salvarCache(chavePerfil, perfilData);
      }

      if (categoriasResponse.ok) {
        const data = await categoriasResponse.json();

        const categoriasComFlag = data.map(c => ({
          ...c,
          isPadrao: c.padrao
        }));

        setCategorias(categoriasComFlag);
        sincronizarFavoritosDasCategorias(perfilId, categoriasComFlag);
      } else {
        const mensagem = await getApiError(
          categoriasResponse,
          "Não foi possível carregar as categorias."
        );

        console.error("Erro ao buscar categorias:", mensagem);

        if (categoriasResponse.status === 401) {
          navigate("/", { replace: true });
        } else {
          aviso(mensagem, "erro");
        }
      }

    } catch (error) {
      // Sem conexão: continua mostrando o que estava no cache
      console.error("Erro ao carregar categorias:", error);
    } finally {
      setLoading(false);
    }
  }, [perfilId, navigate, chavePerfil]);

  // Mantém o cache igual ao que está na tela (inclui excluir/restaurar)
  useEffect(() => {
    if (!loading) salvarCache(chaveCategorias, categorias);
  }, [categorias, loading, chaveCategorias]);

  useEffect(() => {
    carregarCategorias();
  }, [carregarCategorias]);

  useEffect(() => {
    const atualizarFavoritos = () => setFavoritos(lerFavoritos(perfilId));
    atualizarFavoritos();
    return ouvirFavoritos(atualizarFavoritos);
  }, [perfilId]);

  const handleMenuClick = (acao) => {
    setAcaoSelecionada(acao);
    setShowSenhaModal(true);
  };

  const handleSenhaConfirmada = () => {
    setShowSenhaModal(false);

    switch (acaoSelecionada) {
      case "modo-edicao":
        setEditando(true);
        break;

      case "editar-perfil":
        navigate(`/editar-perfil/${perfilId}`);
        break;

      case "criar-botao":
        navigate(`/criar-botao/${perfilId}`);
        break;

      case "criar-categoria":
        navigate(`/criar-categoria/${perfilId}`);
        break;

      case "sair":
        navigate("/meus-perfis");
        break;

      default:
        break;
    }
  };

  const restaurarCategoria = async (categoria) => {
    const ok = await confirmar({
      titulo: "Restaurar categoria?",
      mensagem: (
        <>
          A categoria <strong>{categoria.nome}</strong> vai voltar a ser como
          era originalmente. As alterações feitas nela serão perdidas.
        </>
      ),
      textoConfirmar: "Restaurar",
    });
    if (!ok) return;

    const token = localStorage.getItem("token");
    if (!token) return navigate("/", { replace: true });

    try {
      const response = await fetch(
        `${API_BASE_URL}/categorias/${categoria.id}/restaurar?perfilId=${encodeURIComponent(perfilId)}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error(await getApiError(response));
      }

      const restaurada = await response.json();

      setCategorias((anteriores) =>
        anteriores.map((item) =>
          item.id === categoria.id ? restaurada : item
        )
      );
    } catch (error) {
      aviso(error.message || "Erro ao restaurar categoria.", "erro");
    }
  };

  
  const reproduzirFavorito = (botao) => {
    if (!botao.urlAudio) return;

    const audio = new Audio(botao.urlAudio);

    audio.play().catch(() => {
      aviso("Não foi possível reproduzir o áudio.", "erro");
    });
  };

  const handleCategoriaClick = (categoria) => {
    if (editando) {
      navigate(`/perfil/${perfilId}/categoria/${categoria.id}/editar`);
    } else {
      navigate(`/perfil/${perfilId}/categoria/${categoria.id}`);
    }
  };

  const excluirCategoria = async () => {
    if (!categoriaParaExcluir || excluindo) return;

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/", { replace: true });
      return;
    }

    setExcluindo(true);
    setErroExclusao("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/categorias/${categoriaParaExcluir.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const mensagem = await getApiError(
          response,
          "Não foi possível excluir a categoria."
        );

        throw new Error(mensagem);
      }

      setCategorias((anteriores) => {
        const restantes = anteriores.filter(
          (categoria) => categoria.id !== categoriaParaExcluir.id
        );
        sincronizarFavoritosDasCategorias(perfilId, restantes);
        return restantes;
      });

      setCategoriaParaExcluir(null);
    } catch (error) {
      setErroExclusao(error.message);
    } finally {
      setExcluindo(false);
    }
  };

  if (loading) {
    return <TelaCarregando texto="Carregando categorias..." />;
  }

  return (
    <div className="min-h-screen bg-[#b3daff]">
      <HeaderPerfil
        perfil={perfil}
        onMenuClick={handleMenuClick}
        itemEdicao="Editar categorias"
      />

      <div className="p-4 sm:p-6 max-w-7xl mx-auto">

        {editando && (
          <BarraEdicao
            texto="Toque na categoria que quer editar. Para editar botões, entre na categoria e use o menu."
            onConcluir={() => setEditando(false)}
          />
        )}

        {!editando && favoritos.length > 0 && (
          <>
            <TituloSecao
              titulo="Favoritos"
              subtitulo="Os botões que você mais usa"
            />

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 mb-10">
              {favoritos.map(botao => (
                <BotaoFala
                  key={botao.id}
                  botao={botao}
                  perfilId={perfilId}
                  onClick={reproduzirFavorito}
                />
              ))}
            </div>
          </>
        )}

        <TituloSecao
          titulo="Categorias"
          subtitulo={
            editando
              ? "Escolha a categoria que você quer alterar"
              : "Toque em uma categoria para ver os botões"
          }
        />

        {categorias.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {categorias.map(categoria => (
              <div key={categoria.id} className="relative">
                <CategoriaCard
                  categoria={categoria}
                  onClick={handleCategoriaClick}
                  editando={editando}
                />

                {editando && categoria.padrao && categoria.personalizado && (
                  <AcaoRestaurar
                    nome={categoria.nome}
                    onClick={() => restaurarCategoria(categoria)}
                  />
                )}

                {editando && !categoria.padrao && (
                  <AcaoExcluir
                    nome={categoria.nome}
                    onClick={() => {
                      setErroExclusao("");
                      setCategoriaParaExcluir(categoria);
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-blue-900 text-lg mt-12">
            Nenhuma categoria encontrada.
          </p>
        )}
      </div>

      <ConfirmModal
        aberto={!!categoriaParaExcluir}
        titulo="Excluir categoria?"
        mensagem={
          <>
            A categoria <strong>{categoriaParaExcluir?.nome}</strong> será
            apagada para sempre. Essa ação não pode ser desfeita.
          </>
        }
        textoConfirmar={excluindo ? "Excluindo..." : "Sim, excluir"}
        perigo
        carregando={excluindo}
        erro={erroExclusao}
        onConfirmar={excluirCategoria}
        onCancelar={() => {
          setCategoriaParaExcluir(null);
          setErroExclusao("");
        }}
      />

      {/* Depois do ConfirmModal para ficar por cima dele */}
      <SenhaModal
        isOpen={showSenhaModal}
        onClose={() => setShowSenhaModal(false)}
        onConfirm={handleSenhaConfirmada}
        titulo="Área do responsável"
        mensagem="Para continuar, digite a senha da sua conta."
      />
    </div>
  );
}

function CategoriaCard({ categoria, onClick, editando }) {
  return (
    <button
      type="button"
      onClick={() => onClick(categoria)}
      aria-label={editando ? `Editar categoria ${categoria.nome}` : categoria.nome}
      className="relative w-full text-left bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-transform hover:scale-105 aspect-square flex flex-col"
    >
      <div className="flex-1 min-h-0 p-2 sm:p-3">
        <img
          src={categoria.urlImagem}
          alt={categoria.nome}
          className="w-full h-full object-contain"
          onError={(e) => {
            e.target.src =
              "https://via.placeholder.com/200?text=Sem+Imagem";
          }}
        />
      </div>

      <div className="p-2 sm:p-3 text-center">
        <h3 className="font-bold text-xs sm:text-sm text-blue-900 truncate">
          {categoria.nome}
        </h3>
      </div>

      {editando && <SeloEditar />}
    </button>
  );
}