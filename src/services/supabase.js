import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export async function uploadArquivo(bucket, caminho, arquivo) {
  const { error } = await supabase.storage.from(bucket).upload(caminho, arquivo);

  if (error) {
    throw new Error(`Erro ao fazer upload do arquivo: ${error.message}`);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(caminho);

  return data.publicUrl;
}

export default supabase;
