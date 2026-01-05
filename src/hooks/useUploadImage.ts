import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface UploadImagePayload {
  file: File;
  fileName: string;
  app: string;
}

export interface UploadImageResponse {
  documentId: string;
  object: string;
}

const uploadImage = async (
  payload: UploadImagePayload,
): Promise<UploadImageResponse> => {
  const formData = new FormData();
  formData.append("file", payload.file); // binary file
  formData.append("name", payload.fileName);
  formData.append("app", payload.app);

  const response = await fetch(api.uploadImage, {
    method: "POST",
    body: formData,
    // Don't set Content-Type header, let browser set it with boundary
  });

  if (!response.ok) {
    let errorMessage = "خطا در آپلود عکس";
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      try {
        const errorText = await response.text();
        errorMessage = errorText || errorMessage;
      } catch {
        errorMessage = `خطا در آپلود عکس: ${response.status} ${response.statusText}`;
      }
    }
    throw new Error(errorMessage);
  }

  const result = await response.json();

  // بررسی اینکه آیا سرور "error" برگردانده است
  if (
    result === "error" ||
    (typeof result === "string" && result.toLowerCase() === "error")
  ) {
    throw new Error("خطا در آپلود عکس. لطفا دوباره تلاش کنید.");
  }

  return result;
};

export const useUploadImage = () => {
  return useMutation({
    mutationFn: uploadImage,
  });
};
