import { api } from "./api";

export async function uploadFile(
  file: File,
  onProgress?: (pct: number) => void,
): Promise<{ id: string; url: string; filename: string }> {
  try {
    console.log("Uploading file:", file.name, file.type, file.size);

    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/uploads", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          onProgress(percentCompleted);
        }
      },
    });

    console.log("Upload completed successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Upload error:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to upload file");
  }
}
