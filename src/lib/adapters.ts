import "server-only";
import { Client, handle_file } from "@gradio/client";
import type { Category, ModelId } from "./tryon";

/** Server side only: talks to the Hugging Face Spaces, using HF_TOKEN when it is set. */
type Adapter = {
  space: string;
  endpoint: string;
  params(person: Blob, garment: Blob, category: Category, description: string): Record<string, unknown>;
};

const LEFFA_TYPE: Record<Category, string> = { top: "upper_body", bottom: "lower_body", dress: "dresses" };

export const SERVER_ADAPTERS: Record<ModelId, Adapter> = {
  leffa: {
    space: "franciszzj/Leffa",
    endpoint: "/leffa_predict_vt",
    params: (person, garment, category) => ({
      src_image_path: handle_file(person),
      ref_image_path: handle_file(garment),
      ref_acceleration: false,
      step: 30,
      scale: 2.5,
      seed: 42,
      vt_model_type: category === "top" ? "viton_hd" : "dress_code",
      vt_garment_type: LEFFA_TYPE[category],
      vt_repaint: false,
    }),
  },
  idmvton: {
    space: "yisol/IDM-VTON",
    endpoint: "/tryon",
    params: (person, garment, _category, description) => ({
      dict: { background: handle_file(person), layers: [], composite: null },
      garm_img: handle_file(garment),
      garment_des: description,
      is_checked: true,
      // Crop a 3:4 area around the person, work on it, paste it back: less squashing, steadier face.
      is_checked_crop: true,
      denoise_steps: 30,
      seed: 42,
    }),
  },
};

export type StreamEvent =
  | { type: "queue"; position: number | null }
  | { type: "generating" }
  | { type: "done"; url: string }
  | { type: "error"; message: string };

function urlFrom(data: unknown): string | null {
  const first = Array.isArray(data) ? data[0] : data;
  if (first && typeof first === "object" && "url" in first) return (first as { url: string }).url;
  return typeof first === "string" ? first : null;
}

export async function* runServer(
  model: ModelId,
  person: Blob,
  garment: Blob,
  category: Category,
  description: string,
  signal: AbortSignal,
): AsyncGenerator<StreamEvent> {
  const a = SERVER_ADAPTERS[model];
  const token = process.env.HF_TOKEN?.trim();
  const client = await Client.connect(a.space, {
    events: ["data", "status"],
    ...(token ? { token: token as `hf_${string}` } : {}),
  });
  const job = client.submit(a.endpoint, a.params(person, garment, category, description));
  signal.addEventListener("abort", () => job.cancel(), { once: true });
  for await (const ev of job) {
    if (signal.aborted) return;
    if (ev.type === "status") {
      if (ev.stage === "error") {
        yield { type: "error", message: typeof ev.message === "string" ? ev.message : "The model returned an error." };
        return;
      }
      if (ev.stage === "pending") {
        yield typeof ev.position === "number" && ev.position > 0 ? { type: "queue", position: ev.position } : { type: "generating" };
      }
    } else if (ev.type === "data") {
      const url = urlFrom(ev.data);
      yield url ? { type: "done", url } : { type: "error", message: "The model sent no image." };
      return;
    }
  }
  yield { type: "error", message: "The model closed without a result." };
}
