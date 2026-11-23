import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://bkueynyjbvxuavboqnja.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrdWV5bnlqYnZ4dWF2Ym9xbmphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMzgwNzEsImV4cCI6MjA3MDYxNDA3MX0.c_9cK5NIgi9e-Tf-xRw3gDi2SJbyxPPb8lBj9Usvck0";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const BUCKET_IMAGENS = "papagaiando-imagens";

// Envia uma imagem para o Storage e devolve a URL pública.
// pasta: ex. "botoes/perfil-123" ou "categorias/perfil-123"
export async function enviarImagem(pasta, arquivo) {
  const caminho = `${pasta}/${Date.now()}_${arquivo.name}`;

  const { error } = await supabase.storage.from(BUCKET_IMAGENS).upload(caminho, arquivo);

  if (error) {
    throw new Error(`Erro ao fazer upload da imagem: ${error.message}`);
  }

  return supabase.storage.from(BUCKET_IMAGENS).getPublicUrl(caminho).data.publicUrl;
}
