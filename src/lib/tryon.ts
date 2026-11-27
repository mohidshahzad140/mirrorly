/** Browser side: asks our own server (/api/tryon) to run each model, with automatic fallback. */
export type Category = "top" | "bottom" | "dress";
export type ModelId = "leffa" | "idmvton";
export type TryOnInput = { person: Blob; garment: Blob; category: Category; description?: string };
export type TryOnStatus =
  | { kind: "sending"; model: ModelId }
  | { kind: "queue"; position: number | null; model: ModelId }
  | { kind: "generating"; model: ModelId }
  | { kind: "switched"; model: ModelId };

export class TryOnError extends Error {
  constructor(
    public code: "quota" | "allFailed" | "cancelled" | "offline",
    message?: string,
    public details: string[] = [],
  ) {
    super(message ?? code);
  }
}

// IDM-VTON only repaints the upper body, so it goes first for tops (Leffa can repaint
// matching pants too). Leffa is the only model that handles bottoms and dresses.
const CHAIN_BY_CATEGORY: Record<Category, ModelId[]> = {
  top: ["idmvton", "leffa"],
  bottom: ["leffa"],
  dress: ["leffa"],
};
const NAME: Record<ModelId, string> = { leffa: "Leffa", idmvton: "IDM-VTON" };

type Wire = { type: string; position?: number | null; url?: string; message?: string };

async function runOne(id: ModelId, input: TryOnInput, signal: AbortSignal, onStatus: (s: TryOnStatus) => void): Promise<Blob> {
  onStatus({ kind: "sending", model: id });
  const form = new FormData();
  form.set("model", id);
  form.set("category", input.category);
  form.set("person", input.person, "person.jpg");
  form.set("garment", input.garment, "garment.jpg");
  form.set("description", (input.description ?? "").slice(0, 200));
  const res = await fetch("/api/tryon", { method: "POST", body: form, signal });
  if (!res.ok || !res.body) throw new Error(`Server error ${res.status}`);
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let nl: number;
    while ((nl = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, nl).trim();
      buf = buf.slice(nl + 1);
      if (!line) continue;
      const ev = JSON.parse(line) as Wire;
      if (ev.type === "queue") onStatus({ kind: "queue", position: ev.position ?? null, model: id });
      else if (ev.type === "generating") onStatus({ kind: "generating", model: id });
      else if (ev.type === "error") throw new Error(ev.message ?? "The model returned an error.");
      else if (ev.type === "done" && ev.url) return await (await fetch(ev.url, { signal })).blob();
    }
  }
  throw new Error("The model closed without a result.");
}

export async function runTryOn(
  input: TryOnInput,
  opts: { signal: AbortSignal; onStatus: (s: TryOnStatus) => void; queueLimitMs?: number },
): Promise<{ image: Blob; model: ModelId }> {
  if (typeof navigator !== "undefined" && !navigator.onLine) throw new TryOnError("offline");
  const limit = opts.queueLimitMs ?? 90_000;
  const chain = CHAIN_BY_CATEGORY[input.category].map((id) => ({ id }));
  const details: string[] = [];
  let sawQuota = false;
  for (let i = 0; i < chain.length; i++) {
    if (opts.signal.aborted) throw new TryOnError("cancelled");
    const { id } = chain[i];
    if (i > 0) opts.onStatus({ kind: "switched", model: id });
    const child = new AbortController();
    const onParentAbort = () => child.abort();
    opts.signal.addEventListener("abort", onParentAbort, { once: true });
    // Only the last model in the chain may wait past the limit.
    const timer = i < chain.length - 1 ? setTimeout(() => child.abort(), limit) : undefined;
    try {
      const image = await runOne(id, input, child.signal, opts.onStatus);
      if (opts.signal.aborted) throw new TryOnError("cancelled");
      return { image, model: id };
    } catch (e) {
      if (opts.signal.aborted) throw new TryOnError("cancelled");
      const msg = child.signal.aborted ? "Took longer than 90 seconds, so Mirrorly moved on." : String((e as Error)?.message ?? e);
      details.push(`${NAME[id]}: ${msg}`);
      if (/quota/i.test(msg)) sawQuota = true;
    } finally {
      clearTimeout(timer);
      opts.signal.removeEventListener("abort", onParentAbort);
    }
  }
  throw new TryOnError(sawQuota ? "quota" : "allFailed", undefined, details);
}
