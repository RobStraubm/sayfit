import { apiClient } from "./client";

export const transcribeApi = {
  transcribe: async (blob: Blob, ext = ".webm"): Promise<string> => {
    const form = new FormData();
    form.append("file", blob, `recording${ext}`);
    const res = await apiClient.post<{ text: string }>("/transcribe", form, {
      timeout: 120_000,
      headers: { "Content-Type": undefined },  // let browser set multipart/form-data + boundary
    });
    return res.data.text;
  },
};
