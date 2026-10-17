import type { Metadata } from "next";
import { ArrowRight, KeyRound, MapPin, PackageSearch } from "lucide-react";
import Link from "next/link";
import { InfoCard, MarketingPage } from "@/components/marketing/marketing-page";

export const metadata: Metadata = { title: "Contact and support" };

export default function ContactPage() {
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;

  return (
    <MarketingPage eyebrow="Contact & support" title="Get help with the right details in hand." description="Choose the path that matches your question. Shipment and payment details are only available after you sign in; tracking codes can be checked publicly.">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <InfoCard icon={<PackageSearch size={19} />} title="Tracking question" description="Use the tracking code to see the latest recorded event before contacting your delivery team." href="/track" linkLabel="Track a shipment" />
        <InfoCard icon={<KeyRound size={19} />} title="Account or booking" description="Sign in to review your bookings, account details, and available shipment actions." href="/login" linkLabel="Open your account" />
        <InfoCard icon={<MapPin size={19} />} title="Route and pricing" description="The booking form calculates charges from the active route and the parcel's entered weight." href="/services" linkLabel="Review delivery services" />
      </div>
      <section className="mt-8 rounded-2xl border border-[#e3eae2] bg-white p-6 sm:p-8">
        <p className="text-[10px] font-extrabold uppercase tracking-[.15em] text-[#548568]">Support contact</p>
        {supportEmail ? (
          <>
            <h2 className="mt-2 text-xl font-semibold tracking-[-.04em]">Send a message to the support team.</h2>
            <p className="mt-2 text-sm leading-6 text-[#718078]">Include your tracking code when asking about a shipment. Never include your password or payment credentials.</p>
            <a href={`mailto:${supportEmail}`} className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-[#176b4d] px-4 text-xs font-extrabold text-white">Email support <ArrowRight size={14} /></a>
          </>
        ) : (
          <>
            <h2 className="mt-2 text-xl font-semibold tracking-[-.04em]">Use the shipment tools for account-specific help.</h2>
            <p className="mt-2 text-sm leading-6 text-[#718078]">No support inbox has been configured for this deployment. Set <code className="rounded bg-[#f0f4ee] px-1.5 py-0.5 text-xs">NEXT_PUBLIC_SUPPORT_EMAIL</code> to publish a working support email here.</p>
            <Link href="/help" className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl border border-[#dfe6de] px-4 text-xs font-extrabold text-[#52645a]">Visit the help center <ArrowRight size={14} /></Link>
          </>
        )}
      </section>
    </MarketingPage>
  );
}
