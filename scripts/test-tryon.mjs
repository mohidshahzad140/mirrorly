import { Client, handle_file } from "@gradio/client";
const base = "https://huggingface.co/spaces/yisol/IDM-VTON/resolve/main/example/";
const person = await (await fetch(base + "human/00034_00.jpg")).blob();
const garment = await (await fetch(base + "cloth/04469_00.jpg")).blob();
const jobs = {
  leffa: ["franciszzj/Leffa", "/leffa_predict_vt", { src_image_path: handle_file(person), ref_image_path: handle_file(garment), ref_acceleration: false, step: 30, scale: 2.5, seed: 42, vt_model_type: "viton_hd", vt_garment_type: "upper_body", vt_repaint: "False" }],
  idmvton: ["yisol/IDM-VTON", "/tryon", { dict: { background: handle_file(person), layers: [], composite: null }, garm_img: handle_file(garment), garment_des: "", is_checked: true, is_checked_crop: false, denoise_steps: 30, seed: 42 }],
};
const which = process.argv[2];
const [space, ep, params] = jobs[which];
const t = Date.now();
try {
  const c = await Client.connect(space);
  const job = c.submit(ep, params);
  for await (const ev of job) {
    if (ev.type === "status") console.log(`[${Math.round((Date.now()-t)/1000)}s] status`, ev.stage, ev.position ?? "", ev.message ?? "");
    if (ev.type === "data") { console.log(`[${Math.round((Date.now()-t)/1000)}s] DATA`, JSON.stringify(ev.data).slice(0, 200)); break; }
  }
} catch (e) { console.log("THROWN", e?.message ?? e); }
process.exit(0);
