import { SiteHeader } from "./SiteHeader";

/** Yellow "liquid" top section shared by the inner pages. */
export function PageHero({ title, intro, children }: { title: React.ReactNode; intro: string; children?: React.ReactNode }) {
  return (
    <section className="relative rounded-br-[200px] rounded-bl-[48px] bg-yellow px-6 pb-24 pt-6 text-void md:px-12 md:pb-32">
      <div className="mx-auto flex max-w-7xl flex-col gap-10">
        <SiteHeader />
        <div className="rise flex flex-wrap items-end justify-between gap-6">
          <h1 className="text-6xl font-extrabold leading-[0.88] tracking-[-3px] md:text-[112px] md:tracking-[-6px]">{title}</h1>
          <p className="max-w-sm text-lg font-medium opacity-80">{intro}</p>
        </div>
        {children}
      </div>
    </section>
  );
}
