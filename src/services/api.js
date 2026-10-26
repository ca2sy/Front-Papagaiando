import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const rotaDeAuth = error.config?.url?.startsWith("/auth/");

    if (error.response?.status === 401 && !rotaDeAuth) {
      localStorage.clear();

      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  }
);

export function mensagemDeErro(error, padrao) {
  if (!axios.isAxiosError(error)) {
    return error.message || padrao;
  }

  const data = error.response?.data;

  if (data?.details?.length) {
    return `${data.message}: ${data.details.join(", ")}`;
  }

  return data?.message || padrao;
}

export default api;
