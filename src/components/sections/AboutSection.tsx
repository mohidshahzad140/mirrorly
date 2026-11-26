import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";

const TEAM = [
  { name: "Mohid Shahzad", role: "Team member" },
  { name: "Abdul Ahad", role: "Team member" },
  { name: "Abaidullah Abid", role: "Team member" },
  { name: "Raheeq Rizwan", role: "Team member" },
];

const BUILT_WITH = [
  { name: "Next.js + React", text: "The website itself: pages, buttons and screens." },
  { name: "Tailwind CSS", text: "The styling: colors, layout and the smooth motion." },
  { name: "Gradio client", text: "Connects the browser to the AI models on Hugging Face." },
  { name: "Leffa and IDM-VTON", text: "The open-source AI models that make each try-on." },
];

export function AboutSection() {
  return (
    <section id="about" aria-label="About" className="relative overflow-hidden bg-void pb-24">
      <div className="blob absolute -right-24 top-[700px] h-80 w-80 bg-yellow opacity-80" aria-hidden />
      <PageHero title={<>About<br />Mirrorly.</>} intro="A virtual fitting room, built as a human-computer interaction project." />

      <section className="relative mx-auto flex max-w-7xl flex-col gap-6 px-6 py-16 md:px-12">
        <Reveal className="flex max-w-3xl flex-col gap-4">
          <span className="text-xs font-bold tracking-[2px] text-yellow">WHY WE BUILT IT</span>
          <h2 className="text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">Buying clothes online is a guess.</h2>
          <p className="text-base leading-relaxed text-white/70">
            You can&apos;t see how something looks on you until it arrives. Mirrorly lets you see it first, with a photo you already have, in about a minute. Our focus was making that feel simple: three clear steps, honest waiting, and plain messages when something goes wrong.
          </p>
          <p className="text-sm text-white/70">HCI and Computer Graphics, University of Faisalabad, 5th semester, Fall 2026. Supervised by Hassan Raza.</p>
        </Reveal>
      </section>

      <section className="relative mx-auto flex max-w-7xl flex-col gap-8 px-6 md:px-12">
        <Reveal>
          <span className="text-xs font-bold tracking-[2px] text-yellow">THE TEAM</span>
          <h2 className="mt-3 text-4xl font-extrabold tracking-tight md:text-6xl">Four people, one mirror.</h2>
        </Reveal>
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TEAM.map((m, i) => (
            <li key={m.name}>
              <Reveal delay={i * 100} className="lift flex h-full flex-col gap-6 rounded-[32px] bg-card p-6 shadow-2xl">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow text-2xl font-extrabold text-void" aria-hidden>
                  {m.name.replace(/[^A-Za-z]/g, "").charAt(0) || "?"}
                </span>
                <span className="flex flex-col gap-1">
                  <strong className="text-xl font-bold">{m.name}</strong>
                  <span className="text-sm text-white/70">{m.role}</span>
                </span>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      <section className="relative mx-auto mt-20 max-w-7xl px-4 md:px-12">
        <Reveal className="flex flex-col gap-8 rounded-[32px_100px_32px_100px] bg-yellow px-6 py-12 text-void md:px-16">
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold tracking-[2px]">BUILT WITH</span>
            <h2 className="text-4xl font-extrabold tracking-tight md:text-5xl">The tools behind it.</h2>
          </div>
          <ul className="grid gap-4 md:grid-cols-2">
            {BUILT_WITH.map((b) => (
              <li key={b.name} className="flex flex-col gap-1 border-t-2 border-void/15 pt-4">
                <strong className="text-lg font-bold">{b.name}</strong>
                <span className="text-sm font-medium opacity-80">{b.text}</span>
              </li>
            ))}
          </ul>
          <Link href="#try-on" className="pill flex h-14 items-center self-start rounded-full bg-void px-7 font-bold text-white">Try it on</Link>
        </Reveal>
      </section>
    </section>
  );
}
