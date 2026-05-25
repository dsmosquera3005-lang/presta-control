import { supabase } from "@/integrations/supabase/client";

export async function uploadClientFile(
  userId: string,
  file: File,
  kind: string
): Promise<string> {
  const ext = file.name.split(".").pop() || "bin";
  const path = `${userId}/${kind}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("client-docs").upload(path, file, {
    upsert: false,
    contentType: file.type,
  });
  if (error) throw error;
  const { data } = await supabase.storage.from("client-docs").createSignedUrl(path, 60 * 60 * 24 * 365);
  return data?.signedUrl ?? path;
}