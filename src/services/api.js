export const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3000"
).replace(/\/$/, "");

export async function getApiError(
  response,
  fallback = "Não foi possível concluir a operação."
) {
  const data = await response.json().catch(() => null);

  const details = Array.isArray(data?.details)
    ? data.details.join("; ")
    : "";

  return details || data?.message || fallback;
}