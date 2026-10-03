import useSWRMutation from "swr/mutation";
import { mutate } from "swr";
import { api } from "../../lib/api";

// Puts the fresh user straight into the /me cache so every screen updates at once
const syncUser = (data) => mutate("/auth/me", { user: data.user }, { revalidate: false });

const patchProfile = (_key, { arg }) => api("/profile", { method: "PATCH", body: arg });

// Body examples: { name }, { photoUrl: null }, { offer: {...} }, { offer: null }
export const useUpdateProfile = () =>
  useSWRMutation("/profile", patchProfile, { onSuccess: syncUser });

// Shrinks big phone photos in the browser before upload (falls back to the original file)
async function shrink(file) {
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, 1200 / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext("2d").drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((r) => canvas.toBlob(r, "image/jpeg", 0.85));
    return blob || file;
  } catch {
    return file;
  }
}

// 1) get signature  2) upload straight to Cloudinary  3) save the URL on our server
async function uploadPhoto(_key, { arg: file }) {
  if (file.size > 15 * 1024 * 1024) throw new Error("Photo is too large (max 15 MB)");

  const { uploadUrl, fields } = await api("/profile/photo-signature", { method: "POST" });

  const body = new FormData();
  Object.entries(fields).forEach(([k, v]) => body.append(k, v));
  body.append("file", await shrink(file), "photo.jpg");

  const res = await fetch(uploadUrl, { method: "POST", body }); // no auth header to Cloudinary
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error?.message || "Photo upload failed");

  return patchProfile(null, { arg: { photoUrl: json.secure_url } });
}

export const useUploadPhoto = () =>
  useSWRMutation("/profile/photo", uploadPhoto, { onSuccess: syncUser });