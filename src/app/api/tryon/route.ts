import { runServer, type StreamEvent } from "@/lib/adapters";
import type { Category, ModelId } from "@/lib/tryon";

export const runtime = "nodejs";
export const maxDuration = 300;

const MODELS: ModelId[] = ["leffa", "idmvton"];
const CATEGORIES: Category[] = ["top", "bottom", "dress"];

/** Runs one model and streams its progress as newline-delimited JSON. */
export async function POST(req: Request) {
  const form = await req.formData();
  const model = form.get("model") as ModelId;
  const category = form.get("category") as Category;
  const person = form.get("person");
  const garment = form.get("garment");
  if (!MODELS.includes(model) || !CATEGORIES.includes(category) || !(person instanceof Blob) || !(garment instanceof Blob)) {
    return new Response("Bad request", { status: 400 });
  }
  const enc = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (e: StreamEvent) => controller.enqueue(enc.encode(JSON.stringify(e) + "\n"));
      try {
        for await (const e of runServer(model, person, garment, category, req.signal)) send(e);
      } catch (e) {
        send({ type: "error", message: String((e as Error)?.message ?? e) });
      } finally {
        controller.close();
      }
    },
  });
  return new Response(stream, { headers: { "Content-Type": "application/x-ndjson", "Cache-Control": "no-store" } });
}
