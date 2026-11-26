import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { SiteHeader } from "@/components/SiteHeader";

const steps = [
  { word: "Snap.", text: "Add a full-body photo, standing straight." },
  { word: "Pick.", text: "Add the clothes: a top, bottom or dress." },
  { word: "See.", text: "You, wearing it, side by side with your original photo." },
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-void">
      <section className="relative rounded-br-[120px] rounded-bl-[40px] bg-yellow px-6 pb-32 pt-4 text-void md:rounded-br-[240px] md:px-12">
        <div className="mx-auto flex max-w-6xl flex-col gap-6">
          <SiteHeader />
          <span className="rise mt-6 self-start rounded-full border-2 border-void/20 px-4 py-2 text-xs font-bold tracking-[2px]">VIRTUAL FITTING ROOM</span>
          <h1 className="rise max-w-4xl text-[68px] font-extrabold leading-[0.92] tracking-[-3.5px] md:text-[120px] md:tracking-[-6px]" style={{ animationDelay: "80ms" }}>
            Wear it before you buy it.
          </h1>
          <p className="rise max-w-sm text-base font-medium leading-relaxed opacity-80" style={{ animationDelay: "160ms" }}>
            Upload a full-body photo and any piece of clothing. Mirrorly shows you wearing it.
          </p>
          <div className="rise flex flex-wrap gap-2" style={{ animationDelay: "240ms" }}>
            <Link href="/try-on" className="pill flex h-14 items-center rounded-full bg-void px-7 font-bold text-white">Try it on</Link>
            <a href="#how" className="pill flex h-14 items-center rounded-full border-2 border-void/20 px-6 font-medium">How it works</a>
          </div>
        </div>
      </section>

      <div className="blob absolute -left-20 top-[620px] h-64 w-64 bg-yellow opacity-90" aria-hidden />

      <section id="how" className="relative mx-auto flex max-w-6xl flex-col gap-6 px-6 py-16 md:px-12">
        <span className="text-xs font-bold tracking-[2px] text-yellow">HOW IT WORKS</span>
        <h2 className="text-4xl font-extrabold leading-none tracking-tight md:text-6xl">Three steps. One mirror.</h2>
        <ol className="flex flex-col">
          {steps.map((s, i) => (
            <li key={s.word} className={`border-t border-white/10 ${i === steps.length - 1 ? "border-b" : ""}`}>
              <Reveal delay={i * 120} className="flex flex-col gap-2 py-6">
                <strong className={`text-[56px] font-extrabold leading-[0.9] tracking-[-2.5px] md:text-[96px] ${i === steps.length - 1 ? "text-yellow" : ""}`}>{s.word}</strong>
                <span className="text-sm leading-relaxed text-white/70">{s.text}</span>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      <section className="relative mx-4 mb-12 flex flex-col gap-4 rounded-[100px_32px_100px_32px] bg-yellow px-6 py-10 text-void md:mx-auto md:max-w-6xl md:px-12">
        <h2 className="text-4xl font-extrabold leading-none tracking-tight">Your mirror is ready.</h2>
        <p className="text-sm font-medium opacity-80">Free to use. No account needed to try it.</p>
        <Link href="/try-on" className="pill flex h-13 items-center self-start rounded-full bg-void px-7 py-4 font-bold text-white">Start now</Link>
      </section>
    </main>
  );
}
