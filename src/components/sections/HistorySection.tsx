"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ExampleFigure } from "@/components/ExampleFigure";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { deleteLocal, HISTORY_EVENT, listLocal, type HistoryItem } from "@/lib/localHistory";

const CATEGORY_LABEL = { top: "Top", bottom: "Bottom", dress: "Dress" } as const;
const MODEL_NAME = { leffa: "Leffa", idmvton: "IDM-VTON" } as const;

const EXAMPLES = [
  { title: "Yellow rain jacket", category: "Top", fig: { skin: "#C9A68A", hair: "#111111", top: "#FDE047", bottom: "#3D4A5C" } },
  { title: "Purple knit sweater", category: "Top", fig: { skin: "#8D6A52", hair: "#111111", top: "#7C3AED", bottom: "#2B2B2B" } },
  { title: "Blue wide-leg jeans", category: "Bottom", fig: { skin: "#E2BFA3", hair: "#B5793F", top: "#E8E8E8", bottom: "#3B5BA9" } },
  { title: "Red hoodie", category: "Top", fig: { skin: "#5C3D2E", hair: "#1E1714", top: "#E5484D", bottom: "#7A8B9C" } },
];

type Shown = HistoryItem & { url: string };

export function HistorySection() {
  const [items, setItems] = useState<Shown[] | null>(null);
  const [open, setOpen] = useState<Shown | null>(null);

  useEffect(() => {
    let urls: string[] = [];
    const load = () =>
      listLocal()
        .then((list) => {
          urls.forEach((u) => URL.revokeObjectURL(u));
          const shown = list.map((i) => ({ ...i, url: URL.createObjectURL(i.image) }));
          urls = shown.map((x) => x.url);
          setItems(shown);
        })
        .catch(() => setItems([]));
    load();
    window.addEventListener(HISTORY_EVENT, load);
    return () => {
      window.removeEventListener(HISTORY_EVENT, load);
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function remove(id: string) {
    await deleteLocal(id);
    setItems((prev) => prev?.filter((i) => i.id !== id) ?? null);
    setOpen(null);
  }

  return (
    <section id="history" aria-label="History" className="relative overflow-hidden bg-void pb-24">
      <div className="blob absolute -left-24 top-[520px] h-72 w-72 bg-yellow opacity-80" aria-hidden />
      <PageHero title={<>Your<br />history.</>} intro="Every try-on you make is saved here, on this device only." />

      <div className="relative mx-auto -mt-16 max-w-7xl px-4 md:px-12">
        {items && items.length > 0 && (
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => (
              <li key={item.id}>
                <Reveal delay={(i % 3) * 100}>
                  <button onClick={() => setOpen(item)} className="lift flex w-full flex-col gap-3 rounded-[32px] bg-card p-3 text-left shadow-2xl">
                    <span className="block h-80 overflow-hidden rounded-[24px] bg-well">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.url} alt={`Try-on from ${new Date(item.createdAt).toLocaleString()}`} className="h-full w-full object-contain" />
                    </span>
                    <span className="flex items-center justify-between px-2 pb-1">
                      <span className="text-sm font-bold">{new Date(item.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</span>
                      <span className="rounded-full bg-yellow px-3 py-1 text-xs font-bold text-void">{CATEGORY_LABEL[item.category]}</span>
                    </span>
                  </button>
                </Reveal>
              </li>
            ))}
          </ul>
        )}

        {items && items.length === 0 && (
          <div className="flex flex-col gap-10">
            <Reveal className="flex flex-col items-start gap-4 rounded-[32px] bg-card p-6 shadow-2xl md:flex-row md:items-center md:justify-between md:p-8">
              <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold">No try-ons yet.</h2>
                <p className="text-sm text-white/70">Make your first one and it shows up here. The cards below are examples.</p>
              </div>
              <Link href="#try-on" className="pill flex h-14 items-center rounded-full bg-yellow px-7 font-bold text-void">Make a try-on</Link>
            </Reveal>
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4" aria-label="Example try-ons">
              {EXAMPLES.map((ex, i) => (
                <li key={ex.title}>
                  <Reveal delay={i * 100} className="flex flex-col gap-3 rounded-[32px] bg-card p-3 opacity-90 shadow-2xl">
                    <span className="relative block h-72 overflow-hidden rounded-[24px] bg-well">
                      <ExampleFigure {...ex.fig} />
                      <span className="absolute left-3 top-3 rounded-full bg-void/70 px-3 py-1 text-xs font-bold">Example</span>
                    </span>
                    <span className="flex items-center justify-between px-2 pb-1">
                      <span className="text-sm font-bold">{ex.title}</span>
                      <span className="rounded-full border border-white/20 px-3 py-1 text-xs font-medium">{ex.category}</span>
                    </span>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {open && (
        <div className="overlay fixed inset-0 z-50 flex items-center justify-center bg-void/80 p-4" onClick={() => setOpen(null)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Try-on details"
            className="overlay-card flex max-h-full w-full max-w-md flex-col gap-4 rounded-[32px] bg-card p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-[60vh] overflow-hidden rounded-[24px] bg-well">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={open.url} alt="Try-on result" className="h-full w-full object-contain" />
            </div>
            <p className="px-1 text-xs text-white/70">
              {CATEGORY_LABEL[open.category]}, made by the free {MODEL_NAME[open.model]} model on {new Date(open.createdAt).toLocaleString()}.
            </p>
            <div className="flex gap-2">
              <a href={open.url} download="mirrorly-try-on.jpg" className="pill flex h-12 flex-1 items-center justify-center rounded-full bg-yellow font-bold text-void">Download</a>
              <button onClick={() => remove(open.id)} className="pill h-12 flex-1 rounded-full border-2 border-white/20 font-medium">Delete</button>
              <button onClick={() => setOpen(null)} aria-label="Close" className="pill h-12 w-12 rounded-full border-2 border-white/20 font-bold">✕</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
