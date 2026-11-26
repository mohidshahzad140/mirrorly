"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "/try-on", label: "Try on" },
  { href: "/history", label: "History" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/about", label: "About" },
];

/** Sits on a yellow section: dark text, dark active pill. */
export function SiteHeader() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);

  return (
    <header className="relative z-20 flex h-12 items-center justify-between text-void">
      <Link href="/" className="text-2xl font-extrabold tracking-tight md:text-[28px]">Mirrorly</Link>
      <nav aria-label="Main" className="hidden gap-2 md:flex">
        {LINKS.map((l) => {
          const active = path === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active ? "page" : undefined}
              className={`pill rounded-full px-5 py-2.5 text-sm ${active ? "bg-void font-bold text-yellow" : "border-2 border-void/20 font-medium"}`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="pill h-11 rounded-full bg-void px-5 text-sm font-medium text-white md:hidden"
      >
        {open ? "Close" : "Menu"}
      </button>
      <div
        id="mobile-menu"
        className={`menu-panel absolute right-0 top-14 flex w-56 flex-col gap-1 rounded-[32px] bg-void p-3 shadow-2xl md:hidden ${open ? "menu-open" : ""}`}
      >
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            aria-current={path === l.href ? "page" : undefined}
            tabIndex={open ? 0 : -1}
            className={`rounded-full px-5 py-3 text-sm ${path === l.href ? "bg-yellow font-bold text-void" : "font-medium text-white"}`}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
