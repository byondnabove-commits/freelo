import { api } from "@/lib/api";

type UploadResponse = {
  url: string;
};

export async function uploadLogo(file: File) {
  const form = new FormData();

  form.append("logo", file);

  const { data } = await api.post<UploadResponse>("/api/upload/logo", form);

  return data.url;
}
