import type { Metadata } from "next";
import { ArrowRight, Eye, Handshake, Layers3, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { InfoCard, MarketingPage } from "@/components/marketing/marketing-page";

export const metadata: Metadata = { title: "About GOparcel" };

export default function AboutPage() {
  return (
    <MarketingPage eyebrow="About GOparcel" title="A clearer way to manage the journey between two addresses." description="GOparcel is a courier logistics platform built around practical delivery work: create a shipment, price its route, record each handoff, and give every role the tools it needs.">
      <div className="grid gap-4 sm:grid-cols-2">
        <InfoCard icon={<Layers3 size={19} />} title="One connected workflow" description="Shipment booking, route pricing, courier assignment, tracking events, and verified checkout work together through the courier API." />
        <InfoCard icon={<Eye size={19} />} title="Visible progress" description="Each shipment has a status and timeline so customers and delivery teams can understand what has happened and what is next." />
        <InfoCard icon={<Handshake size={19} />} title="Clear responsibilities" description="Customer, courier, and administrator workspaces expose the actions that fit each account role. The backend enforces access." />
        <InfoCard icon={<ShieldCheck size={19} />} title="Real operational data" description="Shipment, user, payment, hub, and activity views are loaded from the connected backend rather than sample dashboard records." />
      </div>
      <section className="mt-8 rounded-2xl border border-[#e2e9e1] bg-white p-6 sm:p-8">
        <p className="text-[10px] font-extrabold uppercase tracking-[.15em] text-[#548568]">Built for real workflows</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-[-.05em]">From booking to proof of progress.</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#718078]">Route charges come from configured zone pricing and shipment weight. Tracking follows backend shipment events. Payments are reported as paid only after the backend confirms the provider callback.</p>
        <Link href="/services" className="mt-5 inline-flex items-center gap-2 text-xs font-extrabold text-[#28734d]">Explore services <ArrowRight size={14} /></Link>
      </section>
    </MarketingPage>
  );
}
