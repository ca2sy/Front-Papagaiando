import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";

import Login from "./pages/Login/Login";
import Cadastro from "./pages/Login/Cadastro";
import MeusPerfis from "./pages/Perfil/MeusPerfis";
import CriarPerfil from "./pages/Perfil/CriarPerfil";
import CategoriasPage from "./pages/Categorias/Categorias";
import BotoesPage from "./pages/Botoes/Botoes";
import EditarPerfil from "./pages/Perfil/EditarPerfil";
import CriarCategoria from "./pages/Categorias/CriarCategoria";
import CriarBotao from "./pages/Botoes/CriarBotao";
import EditarCategoria from "./pages/Categorias/EditarCategoria";
import EditarBotao from "./pages/Botoes/EditarBotao";
import MinhaConta from "./pages/Perfil/MinhaConta";
import RotaProtegida from "./components/RotaProtegida";
import AvisoContainer from "./components/AvisoContainer";
import { ConfirmacaoContainer } from "./components/ConfirmModal";
import ErroTela from "./components/ErroTela";
import TelaAcesso from "./components/TelaAcesso";

createRoot(document.getElementById("root")).render(
  <ErroTela>
    <BrowserRouter>
      <AvisoContainer />
      <ConfirmacaoContainer />
      <Routes>
        <Route element={<TelaAcesso />}>
          <Route path="/" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
        </Route>

        <Route element={<RotaProtegida />}>
          <Route path="/meus-perfis" element={<MeusPerfis />} />
          <Route path="/criar-perfil" element={<CriarPerfil />} />
          <Route
            path="/perfil/:perfilId/categorias"
            element={<CategoriasPage />}
          />
          <Route
            path="/perfil/:perfilId/categoria/:categoriaId"
            element={<BotoesPage />}
          />
          <Route path="/editar-perfil/:perfilId" element={<EditarPerfil />} />
          <Route
            path="/criar-categoria/:perfilId"
            element={<CriarCategoria />}
          />
          <Route path="/criar-botao/:perfilId" element={<CriarBotao />} />
          <Route
            path="/perfil/:perfilId/categoria/:categoriaId/editar"
            element={<EditarCategoria />}
          />
          <Route
            path="/perfil/:perfilId/categoria/:categoriaId/botao/:botaoId/editar"
            element={<EditarBotao />}
          />
          <Route path="/minha-conta" element={<MinhaConta />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </ErroTela>,
);
