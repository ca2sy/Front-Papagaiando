import { Navigate, Outlet } from "react-router-dom";

export default function RotaProtegida() {
  const token = localStorage.getItem("token");

  return token
    ? <Outlet />
    : <Navigate to="/" replace />;
}