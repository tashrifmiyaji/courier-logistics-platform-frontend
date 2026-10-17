import type { Metadata } from "next";
import { ArrowRight, CircleHelp, CreditCard, MapPin, PackageSearch } from "lucide-react";
import Link from "next/link";
import { InfoCard, MarketingPage } from "@/components/marketing/marketing-page";

export const metadata: Metadata = { title: "Help and support" };

const helpTopics = [
  { id: "booking", title: "How do I book a shipment?", answer: "Sign in or create an account, open the customer dashboard, and choose New shipment. Select the active pickup and delivery hubs, enter parcel details, calculate the route charge, then confirm the booking." },
  { id: "tracking", title: "How do I track a parcel?", answer: "Enter the tracking code from the booking confirmation on the public tracking page. The timeline shows the shipment's recorded status updates." },
  { id: "payments", title: "When is a payment confirmed?", answer: "A browser return is not proof of payment. GOparcel checks the payment record and shows confirmation only after the backend marks it PAID. If checkout has just finished, revisit the result page shortly." },
  { id: "cancellation", title: "Can I cancel a shipment?", answer: "Open the shipment details from your dashboard. The cancel action is offered only while the shipment is eligible; the backend remains the authority on allowed status changes." },
  { id: "account", title: "Why can’t I open a dashboard page?", answer: "Dashboard features depend on your account role. Sign in again if your session has expired, or use the links below to open your account and shipments." },
];

export default function HelpPage() {
  return (
    <MarketingPage eyebrow="Help center" title="Answers for the next step." description="Quick guidance for booking, tracking, account access, and payments on the GOparcel platform.">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <InfoCard icon={<PackageSearch size={19} />} title="Find a parcel" description="Look up a shipment with the code from its booking confirmation." href="/track" linkLabel="Open tracking" />
        <InfoCard icon={<MapPin size={19} />} title="Book or manage" description="Sign in to create bookings and see account-specific shipment actions." href="/login" linkLabel="Open account" />
        <InfoCard icon={<CreditCard size={19} />} title="Payment help" description="Payment status is based on the backend's verified payment record." href="#payments" linkLabel="Read payment answer" />
        <InfoCard icon={<CircleHelp size={19} />} title="See available tools" description="Review the current booking, tracking, payment, and workspace features." href="/services" linkLabel="View services" />
      </div>
      <div className="mt-8 grid gap-3">
        {helpTopics.map((topic) => <details id={topic.id} key={topic.id} className="group rounded-2xl border border-[#e3eae2] bg-white p-5">
          <summary className="cursor-pointer list-none text-sm font-extrabold marker:hidden">{topic.title}<span className="float-right text-[#548568] transition group-open:rotate-45">+</span></summary>
          <p className="mt-3 max-w-3xl text-xs leading-6 text-[#718078]">{topic.answer}</p>
        </details>)}
      </div>
      <section id="support" className="mt-8 flex flex-col justify-between gap-4 rounded-2xl border border-[#e3eae2] bg-white p-6 sm:flex-row sm:items-center">
        <div><h2 className="text-base font-extrabold">Still need a hand?</h2><p className="mt-1 text-xs leading-5 text-[#718078]">Open your account to see shipment-specific details, or use public tracking for a quick status lookup.</p></div>
        <Link href="/login" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#176b4d] px-4 text-xs font-extrabold text-white">Go to account <ArrowRight size={14} /></Link>
      </section>
    </MarketingPage>
  );
}
