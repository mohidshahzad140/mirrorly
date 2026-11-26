import { Reveal } from "@/components/Reveal";
import { SiteHeader } from "@/components/SiteHeader";
import { AboutSection } from "@/components/sections/AboutSection";
import { HistorySection } from "@/components/sections/HistorySection";
import { HowSection } from "@/components/sections/HowSection";
import { TryOnSection } from "@/components/sections/TryOnSection";

export default function Home() {
  return (
    <main className="relative overflow-hidden bg-void">
      <SiteHeader />

      <section id="home" aria-label="Home" className="relative">
        <div className="relative rounded-br-[120px] rounded-bl-[40px] bg-yellow px-6 pb-32 pt-32 text-void md:rounded-br-[240px] md:px-12 md:pb-40 md:pt-40">
          <div className="mx-auto flex max-w-7xl flex-col gap-6">
            <span className="rise self-start rounded-full border-2 border-void/20 px-4 py-2 text-xs font-bold tracking-[2px]">VIRTUAL FITTING ROOM</span>
            <h1 className="rise max-w-5xl text-[68px] font-extrabold leading-[0.92] tracking-[-3.5px] md:text-[136px] md:tracking-[-7px]" style={{ animationDelay: "80ms" }}>
              Wear it before you buy it.
            </h1>
            <p className="rise max-w-sm text-base font-medium leading-relaxed opacity-80" style={{ animationDelay: "160ms" }}>
              Upload a full-body photo and any piece of clothing. Mirrorly shows you wearing it.
            </p>
            <div className="rise flex flex-wrap gap-2" style={{ animationDelay: "240ms" }}>
              <a href="#try-on" className="pill flex h-14 items-center rounded-full bg-void px-7 font-bold text-white">Try it on</a>
              <a href="#how-it-works" className="pill flex h-14 items-center rounded-full border-2 border-void/20 px-6 font-medium">How it works</a>
            </div>
          </div>
        </div>
        <div className="blob absolute -left-20 bottom-[-120px] h-64 w-64 bg-yellow opacity-90" aria-hidden />
      </section>

      <TryOnSection />
      <HistorySection />
      <HowSection />
      <AboutSection />

      <section aria-label="Get started" className="relative px-4 pb-16 md:px-8">
        <Reveal className="mx-auto flex max-w-7xl flex-col gap-4 rounded-[100px_32px_100px_32px] bg-yellow px-6 py-12 text-void md:px-16">
          <h2 className="text-4xl font-extrabold leading-none tracking-tight md:text-7xl">Your mirror is ready.</h2>
          <p className="text-sm font-medium opacity-80">Free to use. No account needed to try it.</p>
          <a href="#try-on" className="pill flex h-14 items-center self-start rounded-full bg-void px-7 font-bold text-white">Start now</a>
        </Reveal>
        <p className="mx-auto mt-8 max-w-7xl text-xs text-white/50">Mirrorly, an HCI and Computer Graphics project at the University of Faisalabad, Fall 2026.</p>
      </section>
    </main>
  );
}
