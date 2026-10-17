import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Box,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  CreditCard,
  Map,
  MapPin,
  PackageCheck,
  Search,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const serviceSteps = [
  ["01", "Tell us where it’s going", "Choose your pickup and delivery hubs. Your price is clear before you book."],
  ["02", "We pick it up", "A dedicated courier takes your parcel from your door to its first hub."],
  ["03", "Follow every handoff", "See each scan, hub transfer, and delivery attempt as it happens."],
];

export default function Home() {
  return (
    <main className="overflow-hidden">
      <header className="relative z-10 mx-auto flex max-w-[1320px] items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
        <Link href="/" className="flex items-center gap-2.5" aria-label="GOparcel home">
          <span className="grid size-10 place-items-center rounded-2xl bg-[#176b4d] text-white">
            <Box size={21} strokeWidth={2.5} />
          </span>
          <span className="text-[19px] font-extrabold tracking-[-0.06em]">GO<span className="text-[#176b4d]">parcel</span></span>
        </Link>
        <nav className="hidden items-center gap-6 text-[12px] font-semibold text-[#5f6f66] lg:flex" aria-label="Main navigation">
          <Link href="/explore" className="transition hover:text-[#176b4d]">Explore hubs</Link>
          <Link href="/services" className="transition hover:text-[#176b4d]">Services</Link>
          <a href="#how-it-works" className="transition hover:text-[#176b4d]">How it works</a>
          <Link href="/about" className="transition hover:text-[#176b4d]">About</Link>
          <Link href="/track" className="transition hover:text-[#176b4d]">Track parcel</Link>
          <Link href="/help" className="transition hover:text-[#176b4d]">Help</Link>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/login" className="hidden rounded-xl px-4 py-2.5 text-sm font-bold text-[#27372f] transition hover:bg-white sm:block">Log in</Link>
          <Link href="/login" className="inline-flex items-center gap-2 rounded-xl bg-[#176b4d] px-4 py-2.5 text-sm font-bold text-white shadow-[0_8px_20px_-10px_#176b4d] transition hover:-translate-y-0.5 hover:bg-[#10563d]">
            Send a parcel <ArrowUpRight size={16} />
          </Link>
          <details className="relative lg:hidden">
            <summary className="grid size-10 cursor-pointer list-none place-items-center rounded-xl border border-[#dfe6de] bg-white text-xs font-bold text-[#46594c]">Menu</summary>
            <nav className="absolute right-0 top-12 z-30 grid min-w-44 gap-1 rounded-2xl border border-[#e2e9e1] bg-white p-2 shadow-xl" aria-label="Mobile navigation">
              <Link href="/explore" className="rounded-xl px-3 py-2.5 text-xs font-bold text-[#52645a] hover:bg-[#f2f6f1]">Explore hubs</Link>
              <Link href="/services" className="rounded-xl px-3 py-2.5 text-xs font-bold text-[#52645a] hover:bg-[#f2f6f1]">Services</Link>
              <a href="#how-it-works" className="rounded-xl px-3 py-2.5 text-xs font-bold text-[#52645a] hover:bg-[#f2f6f1]">How it works</a>
              <Link href="/about" className="rounded-xl px-3 py-2.5 text-xs font-bold text-[#52645a] hover:bg-[#f2f6f1]">About GOparcel</Link>
              <Link href="/track" className="rounded-xl px-3 py-2.5 text-xs font-bold text-[#52645a] hover:bg-[#f2f6f1]">Track parcel</Link>
              <Link href="/help" className="rounded-xl px-3 py-2.5 text-xs font-bold text-[#52645a] hover:bg-[#f2f6f1]">Help center</Link>
            </nav>
          </details>
        </div>
      </header>

      <section className="relative mx-auto grid min-h-[60svh] max-w-[1320px] items-center gap-8 px-5 py-5 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:gap-12 lg:px-12 lg:py-8">
        <div className="pointer-events-none absolute -left-44 top-16 -z-10 size-[480px] rounded-full bg-[#e1f2e9] blur-[90px]" />
        <div className="max-w-[620px]">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#cde2d5] bg-white/70 px-3.5 py-2 text-[11px] font-extrabold uppercase tracking-[.14em] text-[#176b4d]">
            <Sparkles size={14} /> Bangladesh, delivered better
          </div>
          <h1 className="text-[clamp(2.8rem,6vw,5rem)] font-semibold leading-[.95] tracking-[-.085em] text-[#17251f]">
            Good things
            <br />
            are <span className="font-serif font-normal italic text-[#176b4d]">going places.</span>
          </h1>
          <p className="mt-7 max-w-[475px] text-base leading-7 text-[#697970] sm:text-lg sm:leading-8">
            Send what matters with a local delivery team that keeps you in the loop, from your doorstep to theirs.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/login" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#176b4d] px-5 text-sm font-bold text-white transition hover:bg-[#10563d]">
              Book a pickup <ArrowRight size={16} />
            </Link>
            <Link href="/track" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#d8e1d9] bg-white/70 px-5 text-sm font-bold text-[#27372f] transition hover:border-[#9dbca7] hover:bg-white">
              Track a parcel <MapPin size={16} />
            </Link>
          </div>
          <div className="mt-9 flex items-center gap-3 text-xs font-semibold text-[#77847c]">
            <div className="flex -space-x-2">
              {["A", "S", "R"].map((letter, i) => (
                <span key={letter} className={`grid size-8 place-items-center rounded-full border-2 border-[#f7f8f4] text-[10px] font-extrabold text-white ${i === 0 ? "bg-[#b97855]" : i === 1 ? "bg-[#4f8972]" : "bg-[#778cbb]"}`}>{letter}</span>
              ))}
            </div>
            <span>Made for the people and small businesses moving Bangladesh forward.</span>
          </div>
        </div>

        <div className="relative mx-auto hidden w-full max-w-[510px] lg:ml-auto lg:block">
          <div className="surface-grid relative aspect-[1.04/1] overflow-hidden rounded-[32px] border border-white bg-[#e8f0e8] p-4 shadow-[0_38px_90px_-55px_#24523b] sm:rounded-[42px] sm:p-7">
            <div className="absolute inset-x-0 bottom-0 h-[41%] bg-[#dce9df]" />
            <div className="absolute -left-16 bottom-[30%] h-14 w-[125%] rotate-[-13deg] rounded-full border border-white/70 bg-white/35" />
            <div className="absolute -left-14 bottom-[34%] h-8 w-[125%] rotate-[-13deg] rounded-full border border-dashed border-[#8db7a0]" />
            <div className="absolute left-[12%] top-[18%] flex items-center gap-2 rounded-xl border border-white bg-white/90 px-3 py-2 text-[10px] font-bold text-[#52645a] shadow-lg">
              <span className="size-2 rounded-full bg-[#52a87c]" /> DHAKA HUB
            </div>
            <div className="absolute bottom-[20%] right-[10%] flex items-center gap-2 rounded-xl border border-white bg-white/90 px-3 py-2 text-[10px] font-bold text-[#52645a] shadow-lg">
              <span className="size-2 rounded-full bg-[#f1a35b]" /> ON THE WAY
            </div>
            <div className="absolute left-[10%] top-[39%] grid size-9 place-items-center rounded-full border-4 border-white bg-[#176b4d] text-white shadow-lg sm:size-11">
              <MapPin size={16} />
            </div>
            <div className="absolute bottom-[24%] right-[19%] grid size-9 place-items-center rounded-full border-4 border-white bg-[#e6a465] text-white shadow-lg sm:size-11">
              <MapPin size={16} />
            </div>
            <div className="absolute right-[10%] top-[11%] rotate-[7deg] rounded-3xl bg-[#f1d7b6] p-5 shadow-[0_24px_55px_-22px_#714d32] sm:right-[15%] sm:top-[9%] sm:p-7">
              <div className="absolute -top-2 left-1/2 h-5 w-16 -translate-x-1/2 rounded-b-lg bg-[#d4b184]" />
              <div className="grid size-24 place-items-center rounded-2xl border border-[#e5c79d] bg-[#f9ead4] text-[#895f37] sm:size-36">
                <Box size={52} strokeWidth={1.1} />
              </div>
              <div className="mt-3 h-2 w-16 rounded-full bg-[#dfc399] sm:w-24" />
              <div className="mt-2 h-2 w-10 rounded-full bg-[#dfc399] sm:w-16" />
            </div>
            <div className="absolute bottom-[8%] left-[9%] -rotate-[7deg] rounded-[26px] border border-[#ebf0e9] bg-white p-4 shadow-[0_28px_55px_-30px_#435a4b] sm:bottom-[7%] sm:left-[12%] sm:p-5">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-2xl bg-[#e5f4eb] text-[#176b4d]"><Truck size={19} /></span>
                <div><p className="text-[11px] font-extrabold text-[#24362d]">Your parcel is moving</p><p className="mt-1 text-[9px] font-medium text-[#8a978f]">Dhaka → Chattogram · 2 of 4 stops</p></div>
                <span className="ml-1 grid size-7 place-items-center rounded-full bg-[#176b4d] text-white"><Check size={13} /></span>
              </div>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#e8eee8]"><div className="h-full w-[56%] rounded-full bg-[#4ca779]" /></div>
            </div>
            <div className="absolute right-[8%] top-[48%] grid size-11 place-items-center rounded-2xl bg-[#193d30] text-white shadow-xl sm:right-[9%]">
              <PackageCheck size={21} />
            </div>
          </div>
          <div className="absolute -right-2 -top-5 hidden size-[74px] rotate-12 items-center justify-center rounded-[22px] border border-white bg-[#f8e9d2] text-[#9a6f41] shadow-xl sm:flex"><Sparkles size={25} /></div>
        </div>
      </section>

      <section className="border-y border-[#e8ece5] bg-white/75">
        <div className="mx-auto grid max-w-[1320px] grid-cols-2 gap-5 px-5 py-7 sm:px-8 md:grid-cols-4 md:gap-0 lg:px-12">
          {[
            ["On your terms", "Schedule a pickup that fits your day"],
            ["Every step visible", "A tracking story, not just a status"],
            ["Carefully handled", "Local people who know the route"],
            ["Clear from the start", "Know your delivery charge upfront"],
          ].map(([title, detail], i) => (
            <div key={title} className={`px-2 md:px-7 ${i > 0 ? "md:border-l md:border-[#e8ece5]" : ""}`}>
              <p className="text-[13px] font-extrabold">{title}</p>
              <p className="mt-1.5 max-w-[200px] text-[11px] leading-5 text-[#89958d]">{detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-[1320px] px-5 py-20 sm:px-8 md:py-28 lg:px-12">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[.18em] text-[#518269]">The easy part</p>
            <h2 className="mt-4 max-w-[610px] text-4xl font-semibold leading-[1.08] tracking-[-.06em] sm:text-5xl">From your hands to theirs, <span className="font-serif font-normal italic text-[#176b4d]">with care.</span></h2>
          </div>
          <p className="max-w-[340px] text-sm leading-6 text-[#758279]">Thoughtful logistics for everyday parcels and the businesses behind them.</p>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {serviceSteps.map(([number, title, detail], i) => (
            <article key={number} className="group min-h-[230px] rounded-[26px] border border-[#e4eae3] bg-white p-6 transition hover:-translate-y-1 hover:border-[#bbd7c6] hover:shadow-lg sm:p-7">
              <div className="flex items-center justify-between">
                <span className="grid size-12 place-items-center rounded-2xl bg-[#e8f3eb] text-[#176b4d]">{i === 0 ? <MapPin size={21} /> : i === 1 ? <Truck size={21} /> : <PackageCheck size={21} />}</span>
                <span className="font-mono text-xs font-bold tracking-widest text-[#a1ada4]">{number}</span>
              </div>
              <h3 className="mt-8 text-xl font-semibold tracking-[-.04em]">{title}</h3>
              <p className="mt-2 max-w-[310px] text-sm leading-6 text-[#78867d]">{detail}</p>
              {i === 0 ? <ArrowDownRight size={18} className="mt-5 text-[#82ad92] transition group-hover:translate-x-1 group-hover:translate-y-1" /> : null}
            </article>
          ))}
        </div>
      </section>

      <section id="services" className="border-y border-[#e8ece5] bg-white/70">
        <div className="mx-auto max-w-[1320px] px-5 py-16 sm:px-8 md:py-20 lg:px-12">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div><p className="text-[10px] font-extrabold uppercase tracking-[.17em] text-[#548568]">One delivery desk</p><h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-[-.06em] sm:text-4xl">Everything you need for a clear handoff.</h2></div>
            <Link href="/services" className="inline-flex w-fit items-center gap-1 text-xs font-extrabold text-[#28734d]">Explore all services <ChevronRight size={15} /></Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { icon: <PackageCheck size={20} />, title: "Book a shipment", description: "Add parcel and contact details, choose active hubs, then confirm after a route quote.", meta: "Route-based pricing" },
              { icon: <MapPin size={20} />, title: "Track every step", description: "Look up the latest recorded shipment status and event timeline with a tracking code.", meta: "Public tracking" },
              { icon: <CreditCard size={20} />, title: "Pay with confidence", description: "Eligible bookings can use configured bKash checkout, verified by the backend.", meta: "Verified payment" },
              { icon: <ShieldCheck size={20} />, title: "Manage by role", description: "Customer, courier, and admin workspaces keep operational actions in the right place.", meta: "Role-aware access" },
            ].map((service) => (
              <article key={service.title} className="flex min-h-[250px] flex-col rounded-[22px] border border-[#e4eae3] bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-lg sm:p-6">
                <span className="grid size-11 place-items-center rounded-2xl bg-[#e8f3eb] text-[#176b4d]">{service.icon}</span>
                <h3 className="mt-5 text-base font-extrabold tracking-[-.03em]">{service.title}</h3>
                <p className="mt-2 flex-1 text-xs leading-5 text-[#78867d]">{service.description}</p>
                <div className="mt-4 flex items-center justify-between border-t border-[#edf0eb] pt-3">
                  <span className="text-[9px] font-bold uppercase tracking-wide text-[#859188]">{service.meta}</span>
                  <Link href="/services" className="text-[10px] font-extrabold text-[#28734d]">View details</Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="our-promise" className="mx-auto max-w-[1320px] px-5 pb-20 sm:px-8 md:pb-28 lg:px-12">
        <div className="relative overflow-hidden rounded-[32px] bg-[#173c2e] px-6 py-10 text-white sm:rounded-[38px] sm:px-12 sm:py-14 lg:px-16">
          <div className="absolute -right-20 -top-44 size-[450px] rounded-full border border-white/10" />
          <div className="absolute -right-3 top-[-150px] size-[350px] rounded-full border border-white/10" />
          <div className="relative grid gap-10 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.14em] text-[#c5e6d0]"><ShieldCheck size={14} /> A little more peace of mind</span>
              <h2 className="mt-5 max-w-[620px] text-3xl font-semibold tracking-[-.06em] sm:text-5xl">A delivery should feel like a promise kept.</h2>
              <p className="mt-4 max-w-[520px] text-sm leading-6 text-[#c5d4cb]">We put real checkpoints and real people behind every parcel, so you always know what happens next.</p>
            </div>
            <Link href="/track" className="inline-flex h-12 items-center justify-center gap-2 self-start rounded-xl bg-[#d8efe1] px-5 text-sm font-extrabold text-[#173c2e] transition hover:bg-white md:self-center">Follow a parcel <ChevronRight size={17} /></Link>
          </div>
          <div className="relative mt-10 grid grid-cols-2 gap-4 border-t border-white/15 pt-6 text-xs font-semibold text-[#d0e1d5] sm:grid-cols-3">
            <span className="flex items-center gap-2"><BadgeCheck size={16} /> Verified delivery team</span>
            <span className="flex items-center gap-2"><Clock3 size={16} /> Updates along the way</span>
            <span className="col-span-2 flex items-center gap-2 sm:col-span-1"><MapPin size={16} /> Hubs across the route</span>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1320px] gap-8 px-5 py-16 sm:px-8 md:grid-cols-2 md:items-center md:py-20 lg:px-12">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[.17em] text-[#548568]">The route is yours to choose</p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-[-.06em] sm:text-4xl">Route options come from the live hub network.</h2>
          <p className="mt-4 max-w-xl text-sm leading-6 text-[#718078]">Only hubs currently active in the platform can be selected for a booking. Administrators manage hubs, zones, and route pricing from the operations workspace.</p>
          <Link href="/services" className="mt-5 inline-flex items-center gap-2 text-xs font-extrabold text-[#28734d]">How route pricing works <ArrowRight size={14} /></Link>
        </div>
        <div className="rounded-[26px] border border-[#e2e9e1] bg-white p-6 sm:p-8">
          <span className="grid size-11 place-items-center rounded-2xl bg-[#f5eddf] text-[#926c3d]"><Map size={20} /></span>
          <h3 className="mt-5 text-lg font-extrabold">A quote before you confirm.</h3>
          <p className="mt-2 text-xs leading-5 text-[#7b887f]">Enter the route and parcel weight to see the backend-calculated delivery charge before the shipment is created.</p>
          <Link href="/login" className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-[#176b4d] px-4 text-xs font-extrabold text-white">Start a booking <ArrowRight size={14} /></Link>
        </div>
      </section>

      <section className="border-y border-[#e8ece5] bg-[#f0f5ef]/70">
        <div className="mx-auto grid max-w-[1320px] gap-8 px-5 py-16 sm:px-8 md:grid-cols-[.9fr_1.1fr] md:items-center md:py-20 lg:px-12">
          <div className="surface-grid grid min-h-[230px] place-items-center rounded-[26px] border border-[#e0e8df] bg-white p-6">
            <div className="w-full max-w-sm rounded-2xl border border-[#e6ebe4] bg-white p-5 shadow-[0_20px_50px_-35px_#345840]">
              <div className="flex items-center justify-between"><span className="grid size-10 place-items-center rounded-xl bg-[#e6f2e9] text-[#176b4d]"><BriefcaseBusiness size={18} /></span><span className="rounded-full bg-[#edf5ee] px-2.5 py-1 text-[9px] font-extrabold text-[#3f7952]">SHIPMENT HISTORY</span></div>
              <p className="mt-5 text-sm font-extrabold">Every booking, easier to follow.</p>
              <p className="mt-1 text-[10px] text-[#839087]">Review status, route, and payment from your account.</p>
              <div className="mt-4 flex items-center gap-2"><span className="h-1.5 flex-1 rounded-full bg-[#dcebe0]" /><span className="size-2 rounded-full bg-[#176b4d]" /><span className="h-1.5 w-12 rounded-full bg-[#edf0eb]" /></div>
            </div>
          </div>
          <div><p className="text-[10px] font-extrabold uppercase tracking-[.17em] text-[#548568]">For people and small teams</p><h2 className="mt-3 text-3xl font-semibold tracking-[-.06em] sm:text-4xl">Keep delivery work together, not scattered.</h2><p className="mt-4 max-w-xl text-sm leading-6 text-[#718078]">Book parcels from one customer account, return to shipment details when you need them, and use the tracking timeline as your shared point of reference.</p><Link href="/login" className="mt-5 inline-flex items-center gap-2 text-xs font-extrabold text-[#28734d]">Open your delivery desk <ArrowRight size={14} /></Link></div>
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-5 py-16 sm:px-8 md:py-20 lg:px-12">
        <div className="grid gap-8 rounded-[30px] bg-[#173c2e] p-6 text-white sm:p-10 md:grid-cols-[1fr_auto] md:items-center">
          <div><span className="inline-flex size-10 items-center justify-center rounded-xl bg-white/10 text-[#c5e6d0]"><Search size={19} /></span><h2 className="mt-4 text-3xl font-semibold tracking-[-.06em]">Got a tracking code?</h2><p className="mt-2 max-w-lg text-sm leading-6 text-[#c5d4cb]">Check a parcel's latest recorded event without signing in. Your shipment code is all you need.</p></div>
          <Link href="/track" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#d8efe1] px-5 text-sm font-extrabold text-[#173c2e]">Track a parcel <ArrowRight size={16} /></Link>
        </div>
      </section>

      <section className="border-y border-[#e8ece5] bg-white/70">
        <div className="mx-auto max-w-[960px] px-5 py-16 sm:px-8 md:py-20">
          <p className="text-center text-[10px] font-extrabold uppercase tracking-[.17em] text-[#548568]">Good to know</p>
          <h2 className="mt-3 text-center text-3xl font-semibold tracking-[-.06em]">A few quick answers.</h2>
          <div className="mt-8 grid gap-3">
            {[
              ["How is my delivery charge calculated?", "The booking form requests a quote from the configured route pricing and the weight you enter. Review the amount before confirming."],
              ["Can someone track without an account?", "Yes. Anyone with the shipment's tracking code can use the public tracking page to view its recorded progress."],
              ["When does bKash show as paid?", "Only after the backend verifies the payment and records its status as paid. A successful redirect on its own is not treated as confirmation."],
              ["Where can I get help?", "Visit the help center for booking, tracking, cancellation, and payment guidance."],
            ].map(([question, answer]) => <details key={question} className="group rounded-2xl border border-[#e4eae3] bg-white p-4 sm:p-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-xs font-extrabold sm:text-sm">{question}<CircleHelp size={16} className="shrink-0 text-[#548568]" /></summary><p className="mt-3 max-w-3xl text-xs leading-5 text-[#718078]">{answer}</p></details>)}
          </div>
          <p className="mt-5 text-center"><Link href="/help" className="inline-flex items-center gap-1 text-xs font-extrabold text-[#28734d]">Visit the help center <ArrowRight size={13} /></Link></p>
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-5 py-14 sm:px-8 md:py-16 lg:px-12">
        <div className="flex flex-col justify-between gap-5 rounded-[28px] border border-[#dce8de] bg-[#eaf4ec] p-6 sm:flex-row sm:items-center sm:p-9">
          <div><p className="text-[10px] font-extrabold uppercase tracking-[.15em] text-[#548568]">Your next step</p><h2 className="mt-2 text-2xl font-semibold tracking-[-.05em]">Ready to send something on its way?</h2><p className="mt-2 text-xs leading-5 text-[#65776b]">Create an account to book and manage your shipments.</p></div>
          <Link href="/login" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#176b4d] px-5 text-xs font-extrabold text-white">Get started <ArrowRight size={15} /></Link>
        </div>
      </section>

      <footer className="border-t border-[#e6ebe4] bg-white/65">
        <div className="mx-auto grid max-w-[1320px] gap-6 px-5 py-8 text-xs text-[#7e8b82] sm:grid-cols-2 sm:px-8 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:px-12">
          <div><Link href="/" className="flex items-center gap-2 font-extrabold tracking-[-.04em] text-[#26372e]"><span className="grid size-7 place-items-center rounded-lg bg-[#176b4d] text-white"><Box size={14} /></span>GOparcel</Link><p className="mt-2">Moving the things that move you.</p></div>
          <div className="grid content-start gap-2 font-semibold"><Link href="/explore">Explore hubs</Link><Link href="/services">Services</Link><Link href="/about">About GOparcel</Link></div>
          <div className="grid content-start gap-2 font-semibold"><Link href="/track">Track parcel</Link><Link href="/help">Help center</Link><Link href="/contact">Contact & support</Link></div>
          <div className="grid content-start gap-2 font-semibold"><span className="text-[10px] font-extrabold uppercase tracking-[.14em]">Contact & community</span>{process.env.NEXT_PUBLIC_SUPPORT_EMAIL ? <a href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}`} className="w-fit hover:text-[#176b4d]">Email support</a> : <span className="text-[10px]">Support email not configured</span>}<a href="https://github.com/tashrifmiyaji/courier-logistics-platform-frontend" target="_blank" rel="noreferrer" className="w-fit hover:text-[#176b4d]">Frontend on GitHub</a><a href="https://github.com/tashrifmiyaji/courier-logistics-platform" target="_blank" rel="noreferrer" className="w-fit hover:text-[#176b4d]">Backend on GitHub</a></div>
          <p className="sm:col-span-2 lg:col-span-4">© {new Date().getFullYear()} GOparcel Logistics</p>
        </div>
      </footer>
    </main>
  );
}
