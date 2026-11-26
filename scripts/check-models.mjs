import { Client } from "@gradio/client";
const spaces = ["franciszzj/Leffa", "zhengchong/CatVTON", "yisol/IDM-VTON", "Kwai-Kolors/Kolors-Virtual-Try-On"];
for (const s of spaces) {
  try {
    const c = await Client.connect(s);
    const api = await c.view_api();
    const eps = Object.entries(api.named_endpoints).map(([n, e]) => `${n}(${e.parameters.map(p => `${p.parameter_name}:${p.python_type?.type ?? p.type}`).join(", ")})`);
    console.log(`OK ${s}\n  ` + eps.join("\n  "));
  } catch (e) { console.log(`FAIL ${s}: ${e.message}`); }
}
process.exit(0);
