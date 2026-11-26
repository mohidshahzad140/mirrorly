import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";

const STEPS = [
  { word: "Snap.", text: "Add a full-body photo of yourself. Mirrorly straightens sideways phone photos and shrinks big ones so they upload fast." },
  { word: "Pick.", text: "Add a photo of the clothes and tell Mirrorly what it is: a top, a bottom or a dress." },
  { word: "See.", text: "An AI model dresses you in it. Drag the slider to compare the result with your original photo." },
];

const TIPS = [
  { title: "Stand straight", text: "Face the camera with your arms a little away from your body." },
  { title: "Show your whole body", text: "Head to shoes in the frame, nothing cut off." },
  { title: "Keep it plain", text: "A simple background and good light give cleaner results." },
  { title: "Photograph clothes flat", text: "Lay the item flat or hang it, on a plain background." },
];

const MODELS = [
  { name: "Leffa", role: "First choice", text: "Handles tops, bottoms and dresses." },
  { name: "IDM-VTON", role: "Backup", text: "Steps in for tops if Leffa is busy or slow." },
];

export function HowSection() {
  return (
    <section id="how-it-works" aria-label="How it works" className="relative overflow-hidden bg-void pb-24">
      <PageHero title={<>How it<br />works.</>} intro="Three steps, about a minute, and no account needed." />

      <section className="mx-auto flex max-w-7xl flex-col px-6 py-16 md:px-12">
        <ol className="flex flex-col">
          {STEPS.map((s, i) => (
            <li key={s.word} className={`border-t border-white/10 ${i === STEPS.length - 1 ? "border-b" : ""}`}>
              <Reveal delay={i * 120} className="grid gap-4 py-8 md:grid-cols-[1fr_1.2fr] md:items-center md:gap-12">
                <strong className={`text-[64px] font-extrabold leading-[0.9] tracking-[-3px] md:text-[120px] md:tracking-[-6px] ${i === STEPS.length - 1 ? "text-yellow" : ""}`}>{s.word}</strong>
                <span className="max-w-md text-base leading-relaxed text-white/70">{s.text}</span>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto flex max-w-7xl flex-col gap-8 px-6 md:px-12">
        <Reveal>
          <span className="text-xs font-bold tracking-[2px] text-yellow">FOR THE BEST RESULT</span>
          <h2 className="mt-3 text-4xl font-extrabold tracking-tight md:text-6xl">Tips that help.</h2>
        </Reveal>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TIPS.map((t, i) => (
            <Reveal key={t.title} delay={i * 100} className="flex h-full flex-col gap-3 rounded-[32px] bg-card p-6 shadow-2xl">
              <h3 className="text-xl font-bold">{t.title}</h3>
              <p className="text-sm leading-relaxed text-white/70">{t.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-7xl px-4 md:px-12">
        <Reveal className="flex flex-col gap-8 rounded-[100px_32px_100px_32px] bg-yellow px-6 py-12 text-void md:px-16">
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold tracking-[2px]">THE AI BEHIND IT</span>
            <h2 className="text-4xl font-extrabold tracking-tight md:text-6xl">Free, open-source models.</h2>
            <p className="max-w-2xl text-base font-medium leading-relaxed opacity-80">
              Mirrorly sends your two photos to free virtual try-on models hosted on Hugging Face. If the first one is busy, it switches to the next one by itself.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {MODELS.map((m) => (
              <div key={m.name} className="flex flex-col gap-2 rounded-[32px] bg-void p-6 text-white">
                <span className="self-start rounded-full bg-yellow px-3 py-1 text-xs font-bold text-void">{m.role}</span>
                <h3 className="text-2xl font-bold">{m.name}</h3>
                <p className="text-sm text-white/70">{m.text}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="mx-auto mt-20 flex max-w-7xl flex-col gap-6 px-6 md:flex-row md:items-end md:justify-between md:px-12">
        <Reveal className="flex max-w-2xl flex-col gap-3">
          <span className="text-xs font-bold tracking-[2px] text-yellow">YOUR PHOTOS</span>
          <h2 className="text-4xl font-extrabold tracking-tight md:text-5xl">What happens to them.</h2>
          <p className="text-base leading-relaxed text-white/70">
            Your photos go to the AI model only to make the try-on. Mirrorly never keeps your original photos. Results are saved in this browser&apos;s history, on this device, and you can delete them any time.
          </p>
        </Reveal>
        <Reveal delay={150}>
          <Link href="#try-on" className="pill flex h-14 items-center rounded-full bg-yellow px-7 font-bold text-void">Try it on</Link>
        </Reveal>
      </section>
    </section>
  );
}
