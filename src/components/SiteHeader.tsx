"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

export const SECTIONS = [
  { id: "home", label: "Home" },
  { id: "try-on", label: "Try on" },
  { id: "history", label: "History" },
  { id: "how-it-works", label: "How it works" },
  { id: "about", label: "About" },
] as const;

type Id = (typeof SECTIONS)[number]["id"];

/** Fixed nav that follows the scroll: a yellow pill slides to the section you are in. */
export function SiteHeader() {
  const [active, setActive] = useState<Id>("home");
  const [open, setOpen] = useState(false);
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null);
  const refs = useRef<Partial<Record<Id, HTMLAnchorElement | null>>>({});

  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id as Id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useLayoutEffect(() => {
    const place = () => {
      const el = refs.current[active];
      if (el) setPill({ left: el.offsetLeft, width: el.offsetWidth });
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [active]);

  return (
    <header className="fixed inset-x-0 top-0 z-40 px-4 pt-4 md:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-full bg-void px-3 py-2 pl-6 shadow-2xl">
        <a href="#home" className="text-xl font-extrabold tracking-tight text-white md:text-2xl">Mirrorly</a>
        <nav aria-label="Sections" className="relative hidden items-center md:flex">
          {pill && (
            <span
              aria-hidden
              className="nav-pill absolute top-0 h-full rounded-full bg-yellow"
              style={{ transform: `translateX(${pill.left}px)`, width: pill.width }}
            />
          )}
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              ref={(el) => {
                refs.current[s.id] = el;
              }}
              href={`#${s.id}`}
              aria-current={active === s.id ? "location" : undefined}
              className={`relative z-10 rounded-full px-5 py-2.5 text-sm transition-colors duration-300 ${active === s.id ? "font-bold text-void" : "font-medium text-white/80 hover:text-white"}`}
            >
              {s.label}
            </a>
          ))}
        </nav>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          className="pill h-11 rounded-full bg-yellow px-5 text-sm font-bold text-void md:hidden"
        >
          {open ? "Close" : SECTIONS.find((s) => s.id === active)?.label}
        </button>
      </div>
      <div
        id="mobile-menu"
        className={`menu-panel absolute right-4 top-20 flex w-56 flex-col gap-1 rounded-[32px] bg-void p-3 shadow-2xl md:hidden ${open ? "menu-open" : ""}`}
      >
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            onClick={() => setOpen(false)}
            tabIndex={open ? 0 : -1}
            className={`rounded-full px-5 py-3 text-sm ${active === s.id ? "bg-yellow font-bold text-void" : "font-medium text-white"}`}
          >
            {s.label}
          </a>
        ))}
      </div>
    </header>
  );
}
