import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";

import Login from "./Login";
import Cadastro from "./Cadastro";
import MeusPerfis from "./MeusPerfis";
import CriarPerfil from "./CriarPerfil";
import CategoriasPage from "./Categorias"; 
import BotoesPage from "./Botoes";
import EditarPerfil from "./EditarPerfil";  

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/meus-perfis" element={<MeusPerfis />} />
        <Route path="/criar-perfil" element={<CriarPerfil />} />
        <Route path="/perfil/:perfilId/categorias" element={<CategoriasPage />} />
        <Route path="/perfil/:perfilId/categoria/:categoriaId" element={<BotoesPage />} />
        <Route path="/editar-perfil/:perfilId" element={<EditarPerfil />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);