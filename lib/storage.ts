const fallbackStorageUrl =
  process.env.NEXT_PUBLIC_API_URL
    ? new URL(process.env.NEXT_PUBLIC_API_URL).origin + "/storage"
    : "http://localhost:8000/storage";

export const STORAGE_URL = (
  process.env.NEXT_PUBLIC_STORAGE_URL ||
  fallbackStorageUrl
).replace(/\/$/, "");

export function getStorageUrl(path: string) {
  return `${STORAGE_URL}/${path.replace(/^\//, "")}`;
}
