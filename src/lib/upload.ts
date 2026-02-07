import { uploadsApi } from '../services/api';

export async function uploadFile(
  file: File,
  onProgress?: (pct: number) => void
): Promise<{ id: string; url: string; filename: string }> {
  // 1. Init
  const initRes = await uploadsApi.init({
    filename: file.name,
    mimeType: file.type,
    size: file.size,
  });
  const { uploadUrl, fileId } = initRes.data;

  // 2. PUT to presigned URL with progress
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error('Upload failed')));
    xhr.onerror = () => reject(new Error('Upload failed'));
    xhr.send(file);
  });

  // 3. Complete
  const completeRes = await uploadsApi.complete(fileId);
  return completeRes.data.file;
}
