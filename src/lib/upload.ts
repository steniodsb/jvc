"use client";

import imageCompression from "browser-image-compression";
import { browserClient } from "./supabase/browser";

const BUCKET = "media";

function path(folder: string, ext: string) {
  const d = new Date();
  const id = crypto.randomUUID().slice(0, 8);
  return `${folder}/${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${Date.now()}-${id}.${ext}`;
}

/** Comprime (WebP, até 1920px) e envia a imagem para o Storage. Retorna a URL pública. */
export async function uploadImage(file: File, folder: string, opts: { maxWidth?: number; keepFormat?: boolean } = {}) {
  let blob: Blob = file;
  let ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const isGif = file.type === "image/gif";
  if (!isGif && !opts.keepFormat) {
    blob = await imageCompression(file, {
      maxWidthOrHeight: opts.maxWidth ?? 1920,
      maxSizeMB: 0.9,
      fileType: "image/webp",
      initialQuality: 0.85,
      useWebWorker: true,
    });
    ext = "webp";
  }
  return uploadBlob(blob, path(folder, ext), blob.type || file.type);
}

export async function uploadFile(file: File, folder: string) {
  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  return uploadBlob(file, path(folder, ext), file.type);
}

async function uploadBlob(blob: Blob, key: string, contentType: string) {
  const supabase = browserClient();
  const { error } = await supabase.storage.from(BUCKET).upload(key, blob, { contentType, cacheControl: "31536000", upsert: false });
  if (error) throw new Error(error.message);
  return supabase.storage.from(BUCKET).getPublicUrl(key).data.publicUrl;
}
