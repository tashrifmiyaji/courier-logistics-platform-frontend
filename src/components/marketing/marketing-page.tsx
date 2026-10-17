import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, Box } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const publicLinks = [
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/track", label: "Track parcel" },
  { href: "/help", label: "Help" },
];

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-[#e5ebe3] bg-[#f7f8f4]/95 backdrop-blur-md">
      <div className="mx-auto flex h-[68px] max-w-[1320px] items-center justify-between gap-3 px-4 sm:px-8 lg:px-12">
        <Link href="/" className="flex shrink-0 items-center gap-2 text-[17px] font-extrabold tracking-[-.06em]" aria-label="GOparcel home">
          <span className="grid size-9 place-items-center rounded-xl bg-[#176b4d] text-white"><Box size={18} /></span>
          <span>GO<span className="text-[#176b4d]">parcel</span></span>
        </Link>
        <nav className="hidden items-center gap-6 text-xs font-bold text-[#607167] md:flex" aria-label="Main navigation">
          {publicLinks.map((link) => <Link key={link.href} href={link.href} className="transition hover:text-[#176b4d]">{link.label}</Link>)}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/login" className="hidden rounded-xl px-3 py-2 text-xs font-bold text-[#36473c] hover:bg-white sm:inline-flex">Log in</Link>
          <Link href="/login" className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[#176b4d] px-3 text-xs font-extrabold text-white transition hover:bg-[#10563d] sm:px-4">Book a pickup <ArrowRight size={14} /></Link>
          <details className="relative md:hidden">
            <summary className="grid size-10 cursor-pointer list-none place-items-center rounded-xl border border-[#dfe6de] bg-white text-xs font-bold text-[#46594c]">Menu</summary>
            <nav className="absolute right-0 top-12 z-40 grid min-w-44 gap-1 rounded-2xl border border-[#e2e9e1] bg-white p-2 shadow-xl" aria-label="Mobile navigation">
              {publicLinks.map((link) => <Link key={link.href} href={link.href} className="rounded-xl px-3 py-2.5 text-xs font-bold text-[#52645a] hover:bg-[#f2f6f1]">{link.label}</Link>)}
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-[#e5ebe3] bg-white/70">
      <div className="mx-auto grid max-w-[1320px] gap-8 px-5 py-10 sm:grid-cols-2 sm:px-8 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-12">
        <div>
          <Link href="/" className="flex w-fit items-center gap-2 text-sm font-extrabold tracking-[-.05em] text-[#26372e]"><span className="grid size-8 place-items-center rounded-lg bg-[#176b4d] text-white"><Box size={15} /></span>GOparcel</Link>
          <p className="mt-3 max-w-xs text-xs leading-5 text-[#7e8b82]">Book a parcel, follow its journey, and manage every delivery in one place.</p>
        </div>
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[.14em] text-[#718078]">Explore</p>
          <div className="mt-3 grid gap-2 text-xs font-semibold text-[#52645a]">
            {publicLinks.map((link) => <Link key={link.href} href={link.href} className="w-fit hover:text-[#176b4d]">{link.label}</Link>)}
          </div>
        </div>
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[.14em] text-[#718078]">Your account</p>
          <div className="mt-3 grid gap-2 text-xs font-semibold text-[#52645a]">
            <Link href="/login" className="w-fit hover:text-[#176b4d]">Sign in or create an account</Link>
            <Link href="/dashboard" className="w-fit hover:text-[#176b4d]">Shipment dashboard</Link>
            <Link href="/help#support" className="w-fit hover:text-[#176b4d]">Get help</Link>
          </div>
        </div>
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[.14em] text-[#718078]">Project source</p>
          <div className="mt-3 grid gap-2 text-xs font-semibold text-[#52645a]">
            <a href="https://github.com/tashrifmiyaji/courier-logistics-platform-frontend" target="_blank" rel="noreferrer" className="w-fit hover:text-[#176b4d]">Frontend repository</a>
            <a href="https://github.com/tashrifmiyaji/courier-logistics-platform" target="_blank" rel="noreferrer" className="w-fit hover:text-[#176b4d]">Backend repository</a>
          </div>
        </div>
      </div>
      <div className="border-t border-[#edf0eb] px-5 py-4 text-center text-[10px] text-[#8a968e]">© {new Date().getFullYear()} GOparcel · Delivery, without the detour.</div>
    </footer>
  );
}

export function MarketingPage({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen">
      <MarketingHeader />
      <section className="mx-auto max-w-[1100px] px-5 pb-16 pt-14 sm:px-8 sm:pb-20 sm:pt-20">
        <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#548568]">{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-[1.06] tracking-[-.07em] sm:text-6xl">{title}</h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-[#718078] sm:text-base">{description}</p>
        <div className="mt-10">{children}</div>
      </section>
      <MarketingFooter />
    </main>
  );
}

export function InfoCard({
  icon,
  title,
  description,
  href,
  linkLabel,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <article className="flex min-h-52 flex-col rounded-2xl border border-[#e3eae2] bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-lg sm:p-6">
      <span className="grid size-10 place-items-center rounded-xl bg-[#e8f3eb] text-[#176b4d]">{icon}</span>
      <h2 className="mt-5 text-base font-extrabold tracking-[-.03em]">{title}</h2>
      <p className="mt-2 flex-1 text-xs leading-5 text-[#7b887f]">{description}</p>
      {href && linkLabel ? <Link href={href} className="mt-4 inline-flex w-fit items-center gap-1 text-[11px] font-extrabold text-[#28734d]">{linkLabel}<ArrowRight size={13} /></Link> : null}
    </article>
  );
}
