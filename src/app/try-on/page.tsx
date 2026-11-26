"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CompareSlider } from "@/components/CompareSlider";
import { MESSAGES } from "@/lib/messages";
import { prepareImage, validateImage } from "@/lib/image";
import { runTryOn, TryOnError, type Category, type ModelId, type TryOnStatus } from "@/lib/tryon";

type Picked = { file: File; url: string } | null;
type Phase = "pick" | "running" | "result" | "error";

const CATEGORIES: { id: Category; label: string }[] = [
  { id: "top", label: "Top" },
  { id: "bottom", label: "Bottom" },
  { id: "dress", label: "Dress" },
];
const MODEL_NAME: Record<ModelId, string> = { leffa: "Leffa", idmvton: "IDM-VTON" };

function PhotoPicker(props: {
  title: string;
  badge: string;
  hint: string;
  picked: Picked;
  error: string | null;
  onPick: (f: File) => void;
  capture?: boolean;
}) {
  const id = `pick-${props.title.replace(/\W/g, "")}`;
  return (
    <section className="flex min-w-0 flex-1 basis-80 flex-col gap-4 rounded-[32px] bg-card p-5 shadow-2xl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{props.title}</h2>
        {props.picked && <span className="rounded-full bg-yellow px-3.5 py-1.5 text-xs font-bold text-void">{props.badge}</span>}
      </div>
      <label htmlFor={id} className="pill relative flex h-80 cursor-pointer items-center justify-center overflow-hidden rounded-[24px] bg-well">
        {props.picked ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={props.picked.url} alt={props.title} className="h-full w-full object-contain" />
        ) : (
          <span className="flex flex-col items-center gap-2 px-6 text-center">
            <span className="text-lg font-bold">Tap to add a photo</span>
            <span className="text-sm text-white/70">{props.hint}</span>
          </span>
        )}
        <input
          id={id}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          {...(props.capture ? { capture: "user" as const } : {})}
          className="sr-only"
          onChange={(e) => e.target.files?.[0] && props.onPick(e.target.files[0])}
        />
      </label>
      {props.error && <p role="alert" className="text-sm font-medium text-yellow">{props.error}</p>}
    </section>
  );
}

export default function TryOnPage() {
  const [person, setPerson] = useState<Picked>(null);
  const [garment, setGarment] = useState<Picked>(null);
  const [personErr, setPersonErr] = useState<string | null>(null);
  const [garmentErr, setGarmentErr] = useState<string | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [phase, setPhase] = useState<Phase>("pick");
  const [status, setStatus] = useState<TryOnStatus | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState<{ url: string; model: ModelId } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const busyRef = useRef(false);

  useEffect(() => {
    if (phase !== "running") return;
    const start = Date.now();
    const t = setInterval(() => setElapsed(Math.round((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(t);
  }, [phase]);

  async function pick(file: File, set: (p: Picked) => void, setErr: (m: string | null) => void) {
    const v = await validateImage(file);
    if (!v.ok) return setErr(v.message);
    setErr(null);
    set({ file, url: URL.createObjectURL(file) });
  }

  async function start() {
    if (busyRef.current || !person || !garment || !category) return;
    busyRef.current = true;
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setPhase("running");
    setElapsed(0);
    setStatus(null);
    setErrorMsg(null);
    try {
      const [p, g] = await Promise.all([prepareImage(person.file), prepareImage(garment.file)]);
      const out = await runTryOn({ person: p, garment: g, category }, { signal: ctrl.signal, onStatus: setStatus });
      if (ctrl.signal.aborted) return;
      setResult({ url: URL.createObjectURL(out.image), model: out.model });
      setPhase("result");
    } catch (e) {
      if (ctrl.signal.aborted || (e instanceof TryOnError && e.code === "cancelled")) {
        setPhase("pick");
      } else {
        const code = e instanceof TryOnError ? e.code : "allFailed";
        setErrorMsg(code === "quota" ? MESSAGES.quota : code === "offline" ? MESSAGES.offline : MESSAGES.allFailed);
        setPhase("error");
      }
    } finally {
      busyRef.current = false;
    }
  }

  function cancel() {
    abortRef.current?.abort();
    setPhase("pick");
  }

  const ready = !!person && !!garment && !!category;
  const statusText =
    status?.kind === "queue"
      ? `${MESSAGES.queue}${status.position ? ` (position ${status.position})` : ""}`
      : status?.kind === "switched"
        ? MESSAGES.switched
        : status?.kind === "generating"
          ? "Dressing you in the new outfit"
          : "Sending your photos to the AI model";

  return (
    <main className="relative min-h-screen overflow-hidden bg-void pb-16">
      <div className="blob absolute -bottom-32 right-[8%] h-[420px] w-[420px] bg-yellow opacity-80" aria-hidden />
      <section className="relative rounded-br-[200px] rounded-bl-[48px] bg-yellow px-6 pb-44 pt-6 text-void md:px-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-10">
          <header className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-extrabold tracking-tight">Mirrorly</Link>
            <Link href="/" className="pill rounded-full border-2 border-void/20 px-5 py-2.5 text-sm font-medium">Home</Link>
          </header>
          <div className="rise flex flex-wrap items-end justify-between gap-6">
            <h1 className="text-6xl font-extrabold leading-[0.88] tracking-[-3px] md:text-[112px] md:tracking-[-6px]">Try-on<br />studio.</h1>
            <p className="max-w-sm text-lg font-medium opacity-80">You on the left, the clothes in the middle, the result on the right.</p>
          </div>
        </div>
      </section>

      <div className="relative mx-auto -mt-36 flex max-w-7xl flex-wrap gap-6 px-4 md:px-12">
        <PhotoPicker
          title="You"
          badge="Photo added"
          hint="Full body, standing straight, plain background."
          picked={person}
          error={personErr}
          capture
          onPick={(f) => pick(f, setPerson, setPersonErr)}
        />

        <div className="flex min-w-0 flex-1 basis-80 flex-col gap-4">
          <PhotoPicker
            title="The clothes"
            badge="Item added"
            hint="A photo of the item, flat or on a hanger."
            picked={garment}
            error={garmentErr}
            onPick={(f) => pick(f, setGarment, setGarmentErr)}
          />
          <fieldset className="rounded-[32px] bg-card p-5">
            <legend className="sr-only">What kind of item is it?</legend>
            <p className="mb-3 text-xs font-bold tracking-[2px] text-white/70" aria-hidden>WHAT KIND OF ITEM IS IT?</p>
            <div className="flex gap-2">
              {CATEGORIES.map((c) => (
                <label
                  key={c.id}
                  className={`pill flex h-12 flex-1 cursor-pointer items-center justify-center rounded-full text-sm ${category === c.id ? "bg-yellow font-bold text-void" : "border-2 border-white/20 font-medium"}`}
                >
                  <input type="radio" name="category" className="sr-only" checked={category === c.id} onChange={() => setCategory(c.id)} />
                  {c.label}
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <section aria-labelledby="result-h" className="float flex min-w-0 flex-1 basis-80 flex-col gap-4 rounded-[32px] bg-card p-5 shadow-2xl">
          <h2 id="result-h" className="text-xl font-bold">Result</h2>
          <div className="relative h-[420px] overflow-hidden rounded-[24px] bg-well">
            {phase === "result" && result && person ? (
              <CompareSlider before={person.url} after={result.url} label="You wearing the new item" />
            ) : phase === "running" ? (
              <>
                <div className="scan absolute inset-x-0 h-[3px] bg-yellow" aria-hidden />
                <div role="status" aria-live="polite" className="absolute inset-x-3 bottom-3 flex flex-col gap-2 rounded-[24px] bg-void p-4">
                  <div className="flex items-baseline justify-between gap-2">
                    <strong className="font-bold">Making your try-on</strong>
                    <span className="text-xs text-white/70">{elapsed} s so far</span>
                  </div>
                  <span className="flex items-center gap-2 text-sm">
                    <span className="spin h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-yellow" aria-hidden />
                    {statusText}
                  </span>
                  <span className="text-xs text-white/70">If this model is busy, Mirrorly tries another one.</span>
                </div>
              </>
            ) : phase === "error" ? (
              <div role="alert" className="flex h-full flex-col items-start justify-end gap-3 p-5">
                <p className="font-bold">{errorMsg}</p>
                <button onClick={start} className="pill rounded-full bg-yellow px-6 py-3 font-bold text-void">Try again</button>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center p-6 text-center text-sm text-white/70">
                Your try-on appears here.
              </div>
            )}
          </div>

          {phase === "running" ? (
            <button onClick={cancel} className="pill h-12 rounded-full border-2 border-white/20 font-medium">Cancel</button>
          ) : phase === "result" && result ? (
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <a href={result.url} download="mirrorly-try-on.jpg" className="pill flex h-12 flex-1 items-center justify-center rounded-full bg-yellow font-bold text-void">Download</a>
                <button onClick={start} className="pill h-12 flex-1 rounded-full border-2 border-white/20 font-medium">Not right? Try again</button>
              </div>
              <p className="text-xs text-white/70">Made by the free {MODEL_NAME[result.model]} model.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <button
                onClick={start}
                disabled={!ready}
                className="pill h-14 rounded-full bg-yellow text-base font-bold text-void disabled:cursor-not-allowed disabled:opacity-40"
              >
                Try it on
              </button>
              {!category && person && garment && <p className="text-sm text-white/70">{MESSAGES.pickCategory}</p>}
            </div>
          )}
          <p className="text-xs leading-relaxed text-white/70">
            Your photo is sent to a free AI model to make the try-on. It is only kept if you save the result.
          </p>
        </section>
      </div>
    </main>
  );
}
