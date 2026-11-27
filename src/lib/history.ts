"use client";
import { deleteLocal, HISTORY_EVENT, listLocal, saveLocal } from "./localHistory";
import { supabase } from "./supabase";
import type { Category, ModelId } from "./tryon";

/**
 * One history API for the UI. Logged in: results go to the user's Supabase account.
 * Logged out: results stay in this browser. On login, browser items move to the account.
 */
export type Entry = {
  id: string;
  url: string;
  category: Category;
  model: ModelId;
  createdAt: number;
  where: "device" | "account";
  path?: string;
};

const BUCKET = "tryons";

async function userId(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

async function saveCloud(uid: string, image: Blob, category: Category, model: ModelId): Promise<void> {
  const path = `${uid}/${crypto.randomUUID()}.${image.type.includes("webp") ? "webp" : image.type.includes("jpeg") ? "jpg" : "png"}`;
  const up = await supabase!.storage.from(BUCKET).upload(path, image, { contentType: image.type || "image/png" });
  if (up.error) throw up.error;
  const ins = await supabase!.from("tryons").insert({ result_path: path, category, model_used: model });
  if (ins.error) {
    await supabase!.storage.from(BUCKET).remove([path]);
    throw ins.error;
  }
}

export async function saveTryOn(image: Blob, category: Category, model: ModelId): Promise<"account" | "device"> {
  const uid = await userId();
  if (uid) {
    await saveCloud(uid, image, category, model);
    window.dispatchEvent(new Event(HISTORY_EVENT));
    return "account";
  }
  await saveLocal({ image, category, model });
  return "device";
}

export async function listTryOns(): Promise<Entry[]> {
  const uid = await userId();
  if (!uid) {
    const local = await listLocal();
    return local.map((i) => ({ id: i.id, url: URL.createObjectURL(i.image), category: i.category, model: i.model, createdAt: i.createdAt, where: "device" }));
  }
  const { data, error } = await supabase!.from("tryons").select("id, result_path, category, model_used, created_at").order("created_at", { ascending: false });
  if (error) throw error;
  if (!data.length) return [];
  const signed = await supabase!.storage.from(BUCKET).createSignedUrls(data.map((r) => r.result_path), 60 * 60);
  if (signed.error) throw signed.error;
  return data.map((r, i) => ({
    id: r.id,
    url: signed.data[i]?.signedUrl ?? "",
    category: r.category as Category,
    model: r.model_used as ModelId,
    createdAt: new Date(r.created_at).getTime(),
    where: "account",
    path: r.result_path,
  }));
}

export async function deleteTryOn(entry: Entry): Promise<void> {
  if (entry.where === "device") return deleteLocal(entry.id);
  const del = await supabase!.from("tryons").delete().eq("id", entry.id);
  if (del.error) throw del.error;
  if (entry.path) await supabase!.storage.from(BUCKET).remove([entry.path]);
}

/** After login: move try-ons saved on this device into the account. Returns how many moved. */
export async function moveDeviceHistoryToAccount(): Promise<number> {
  const uid = await userId();
  if (!uid) return 0;
  const local = await listLocal();
  let moved = 0;
  for (const item of local.reverse()) {
    try {
      await saveCloud(uid, item.image, item.category, item.model);
      await deleteLocal(item.id);
      moved++;
    } catch {
      break; // keep the rest on the device; try again next login
    }
  }
  if (moved) window.dispatchEvent(new Event(HISTORY_EVENT));
  return moved;
}

export { HISTORY_EVENT };
