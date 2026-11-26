import { Reveal } from "./Reveal";

/** Yellow "liquid" band that opens each section of the one-page site. */
export function PageHero({ title, intro, children }: { title: React.ReactNode; intro: string; children?: React.ReactNode }) {
  return (
    <div className="relative mx-4 rounded-tl-[48px] rounded-br-[200px] rounded-bl-[48px] bg-yellow px-6 pb-24 pt-24 text-void md:mx-8 md:px-12 md:pb-32">
      <div className="mx-auto flex max-w-7xl flex-col gap-10">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="text-6xl font-extrabold leading-[0.88] tracking-[-3px] md:text-[112px] md:tracking-[-6px]">{title}</h2>
          <p className="max-w-sm text-lg font-medium opacity-80">{intro}</p>
        </Reveal>
        {children}
      </div>
    </div>
  );
}
