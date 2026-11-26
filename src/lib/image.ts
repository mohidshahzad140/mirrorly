import { MESSAGES } from "./messages";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const MAX_W = 768;
const MAX_H = 1024;

export type Validation = { ok: true; width: number; height: number } | { ok: false; message: string };

export async function validateImage(file: File): Promise<Validation> {
  if (!ACCEPTED.includes(file.type)) return { ok: false, message: MESSAGES.unreadable };
  try {
    const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
    const { width, height } = bmp;
    bmp.close();
    if (height < 512) return { ok: false, message: MESSAGES.tooSmall };
    return { ok: true, width, height };
  } catch {
    return { ok: false, message: MESSAGES.unreadable };
  }
}

/** Upright (EXIF applied), fit within 768x1024, JPEG 0.9. */
export async function prepareImage(file: Blob): Promise<Blob> {
  const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, MAX_W / bmp.width, MAX_H / bmp.height);
  const w = Math.round(bmp.width * scale);
  const h = Math.round(bmp.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, w, h);
  bmp.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode failed"))), "image/jpeg", 0.9),
  );
}
