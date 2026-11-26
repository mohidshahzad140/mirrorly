import { Client, handle_file } from "@gradio/client";

export type Category = "top" | "bottom" | "dress";
export type ModelId = "leffa" | "idmvton";
export type TryOnInput = { person: Blob; garment: Blob; category: Category };
export type TryOnStatus =
  | { kind: "sending"; model: ModelId }
  | { kind: "queue"; position: number | null; model: ModelId }
  | { kind: "generating"; model: ModelId }
  | { kind: "switched"; model: ModelId };

export class TryOnError extends Error {
  constructor(public code: "quota" | "allFailed" | "cancelled" | "offline", message?: string) {
    super(message ?? code);
  }
}

type Adapter = {
  id: ModelId;
  space: string;
  categories: Category[];
  endpoint: string;
  params(input: TryOnInput): Record<string, unknown>;
};

const LEFFA_TYPE: Record<Category, string> = { top: "upper_body", bottom: "lower_body", dress: "dresses" };

export const ADAPTERS: Adapter[] = [
  {
    id: "leffa",
    space: "franciszzj/Leffa",
    categories: ["top", "bottom", "dress"],
    endpoint: "/leffa_predict_vt",
    params: ({ person, garment, category }) => ({
      src_image_path: handle_file(person),
      ref_image_path: handle_file(garment),
      ref_acceleration: "False",
      step: 30,
      scale: 2.5,
      seed: 42,
      vt_model_type: category === "top" ? "viton_hd" : "dress_code",
      vt_garment_type: LEFFA_TYPE[category],
      vt_repaint: "False",
    }),
  },
  {
    id: "idmvton",
    space: "yisol/IDM-VTON",
    categories: ["top"],
    endpoint: "/tryon",
    params: ({ person, garment }) => ({
      dict: { background: handle_file(person), layers: [], composite: null },
      garm_img: handle_file(garment),
      garment_des: "",
      is_checked: true,
      is_checked_crop: false,
      denoise_steps: 30,
      seed: 42,
    }),
  },
];

function imageUrlFrom(data: unknown): string | null {
  const first = Array.isArray(data) ? data[0] : data;
  if (first && typeof first === "object" && "url" in first) return (first as { url: string }).url;
  if (typeof first === "string") return first;
  return null;
}

async function runOne(
  a: Adapter,
  input: TryOnInput,
  signal: AbortSignal,
  onStatus: (s: TryOnStatus) => void,
): Promise<Blob> {
  onStatus({ kind: "sending", model: a.id });
  const client = await Client.connect(a.space);
  const job = client.submit(a.endpoint, a.params(input));
  const cancel = () => job.cancel();
  signal.addEventListener("abort", cancel, { once: true });
  try {
    for await (const ev of job) {
      if (signal.aborted) throw new TryOnError("cancelled");
      if (ev.type === "status") {
        if (ev.stage === "error") throw new Error(typeof ev.message === "string" ? ev.message : "model error");
        if (ev.stage === "pending" && typeof ev.position === "number" && ev.position > 0)
          onStatus({ kind: "queue", position: ev.position, model: a.id });
        else if (ev.stage === "pending") onStatus({ kind: "generating", model: a.id });
      }
      if (ev.type === "data") {
        const url = imageUrlFrom(ev.data);
        if (!url) throw new Error("no image in result");
        const res = await fetch(url, { signal });
        return await res.blob();
      }
    }
    throw new Error("model closed without a result");
  } finally {
    signal.removeEventListener("abort", cancel);
  }
}

export async function runTryOn(
  input: TryOnInput,
  opts: { signal: AbortSignal; onStatus: (s: TryOnStatus) => void; queueLimitMs?: number },
): Promise<{ image: Blob; model: ModelId }> {
  if (typeof navigator !== "undefined" && !navigator.onLine) throw new TryOnError("offline");
  const limit = opts.queueLimitMs ?? 90_000;
  const chain = ADAPTERS.filter((a) => a.categories.includes(input.category));
  let sawQuota = false;
  for (let i = 0; i < chain.length; i++) {
    if (opts.signal.aborted) throw new TryOnError("cancelled");
    const a = chain[i];
    if (i > 0) opts.onStatus({ kind: "switched", model: a.id });
    const child = new AbortController();
    const onParentAbort = () => child.abort();
    opts.signal.addEventListener("abort", onParentAbort, { once: true });
    // Only the last model in the chain is allowed to wait past the limit.
    const timer = i < chain.length - 1 ? setTimeout(() => child.abort(), limit) : undefined;
    try {
      const image = await runOne(a, input, child.signal, opts.onStatus);
      if (opts.signal.aborted) throw new TryOnError("cancelled");
      return { image, model: a.id };
    } catch (e) {
      if (opts.signal.aborted) throw new TryOnError("cancelled");
      const msg = String((e as Error)?.message ?? e).toLowerCase();
      if (msg.includes("quota") || msg.includes("gpu")) sawQuota = true;
    } finally {
      clearTimeout(timer);
      opts.signal.removeEventListener("abort", onParentAbort);
    }
  }
  throw new TryOnError(sawQuota ? "quota" : "allFailed");
}
