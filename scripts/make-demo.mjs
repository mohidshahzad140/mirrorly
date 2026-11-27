// Generates the saved demo-mode results with IDM-VTON. Run: node --env-file=.env.local scripts/make-demo.mjs
import { Client, handle_file } from "@gradio/client";
import { readFile, writeFile } from "node:fs/promises";
const pairs = [["model-1", "top-1"], ["model-3", "top-5"]];
const token = process.env.HF_TOKEN?.trim();
const client = await Client.connect("yisol/IDM-VTON", { events: ["data", "status"], ...(token ? { hf_token: token } : {}) });
for (const [m, t] of pairs) {
  const person = new Blob([await readFile(`public/samples/models/${m}.jpg`)], { type: "image/jpeg" });
  const garment = new Blob([await readFile(`public/samples/clothes/${t}.jpg`)], { type: "image/jpeg" });
  const job = client.submit("/tryon", { dict: { background: handle_file(person), layers: [], composite: null }, garm_img: handle_file(garment), garment_des: "", is_checked: true, is_checked_crop: false, denoise_steps: 30, seed: 42 });
  for await (const ev of job) {
    if (ev.type === "status" && ev.stage === "error") { console.log(m, t, "ERROR", ev.message); break; }
    if (ev.type === "data") {
      const url = ev.data[0].url;
      const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
      await writeFile(`public/demo/${m}-${t}.png`, buf);
      console.log(m, t, "saved", buf.length, "bytes");
      break;
    }
  }
}
process.exit(0);
