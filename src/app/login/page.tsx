import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Box } from "lucide-react";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute -left-40 top-0 -z-10 size-[500px] rounded-full bg-[#e0f1e7] blur-[90px]" />
      <div className="pointer-events-none absolute -bottom-64 -right-32 -z-10 size-[500px] rounded-full bg-[#f5e9d8] blur-[100px]" />
      <div className="w-full max-w-[1020px] overflow-hidden rounded-[30px] border border-[#e5ebe3] bg-white shadow-[0_35px_100px_-55px_#31523c] sm:grid sm:grid-cols-[.92fr_1.08fr]">
        <section className="relative hidden min-h-[650px] flex-col justify-between overflow-hidden bg-[#173c2e] p-10 text-white sm:flex lg:p-12">
          <div className="absolute -right-28 -top-16 size-[360px] rounded-full border border-white/10" />
          <div className="absolute -right-2 top-8 size-[260px] rounded-full border border-white/10" />
          <Link href="/" className="relative flex w-fit items-center gap-2.5 text-lg font-extrabold tracking-[-.06em]">
            <span className="grid size-10 place-items-center rounded-2xl bg-white/15"><Box size={20} /></span>
            parcelpilot
          </Link>
          <div className="relative">
            <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#a7d4b7]">A better way to get there</p>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-[-.06em]">Your parcels have places to be.</h1>
            <p className="mt-4 max-w-[310px] text-sm leading-6 text-[#c5d4cb]">Book a pickup, keep an eye on every handoff, and leave the rest to us.</p>
          </div>
          <div className="relative rounded-2xl border border-white/15 bg-white/[.07] p-4">
            <div className="flex items-center justify-between text-[10px] font-semibold text-[#c8d8ce]">
              <span>SHIPMENT PROGRESS</span><span>02 / 04</span>
            </div>
            <div className="mt-4 flex items-center">
              {[0, 1, 2, 3].map((step) => (
                <div key={step} className="flex flex-1 items-center last:flex-none">
                  <span className={`grid size-6 place-items-center rounded-full text-[10px] ${step < 2 ? "bg-[#a3d7b5] text-[#173c2e]" : "border border-white/35 text-white/60"}`}>{step < 2 ? "✓" : step + 1}</span>
                  {step < 3 ? <span className={`h-px flex-1 ${step < 1 ? "bg-[#a3d7b5]" : "bg-white/25"}`} /> : null}
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-[9px] text-[#b7cbbd]"><span>Booked</span><span>Picked up</span><span>On the way</span><span>Delivered</span></div>
          </div>
        </section>
        <section className="px-5 py-8 sm:px-9 sm:py-10 lg:px-12">
          <Link href="/" className="mb-8 inline-flex items-center gap-1.5 text-xs font-bold text-[#78857d] transition hover:text-[#176b4d] sm:hidden"><ArrowLeft size={15} /> Back to ParcelPilot</Link>
          <div className="mb-7">
            <p className="text-[10px] font-extrabold uppercase tracking-[.17em] text-[#548568]">Your delivery desk</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-.06em]">Welcome back.</h2>
            <p className="mt-2 text-sm text-[#7c8980]">Sign in to see what’s on the move.</p>
          </div>
          <LoginForm />
        </section>
      </div>
    </main>
  );
}
