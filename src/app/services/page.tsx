import type { Metadata } from "next";
import { ArrowRight, CreditCard, MapPin, PackageCheck, Route, Search, Truck } from "lucide-react";
import Link from "next/link";
import { InfoCard, MarketingPage } from "@/components/marketing/marketing-page";

export const metadata: Metadata = { title: "Delivery services" };

const services = [
  { icon: <PackageCheck size={19} />, title: "Book a parcel", description: "Enter sender and receiver details, choose active pickup and delivery hubs, and confirm the booking after checking the route quote.", detail: "Price is calculated from route and parcel weight." },
  { icon: <MapPin size={19} />, title: "Follow a shipment", description: "Use the tracking code from your booking to view its latest status and recorded handoffs without signing in.", detail: "Public tracking by shipment code." },
  { icon: <CreditCard size={19} />, title: "Pay securely", description: "Eligible shipments can be paid through the configured bKash checkout. Payment is shown as complete only after backend verification.", detail: "Verified payment status." },
  { icon: <Truck size={19} />, title: "Manage deliveries", description: "Customers can review their bookings, couriers can update assigned delivery milestones, and administrators can manage network operations.", detail: "Role-based workspace." },
];

export default function ServicesPage() {
  return (
    <MarketingPage eyebrow="What you can do" title="The tools to move every parcel forward." description="GOparcel brings booking, route pricing, delivery updates, and shipment management into one connected workflow.">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {services.map((service) => <InfoCard key={service.title} icon={service.icon} title={service.title} description={`${service.description} ${service.detail}`} />)}
      </div>
      <section className="mt-8 flex flex-col justify-between gap-4 rounded-2xl bg-[#173c2e] p-6 text-white sm:flex-row sm:items-center sm:p-8">
        <div><p className="text-[10px] font-extrabold uppercase tracking-[.14em] text-[#b8ddc5]">Ready when you are</p><h2 className="mt-2 text-xl font-semibold">Start a shipment with a clear quote.</h2></div>
        <Link href="/login" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#dff2e9] px-4 text-xs font-extrabold text-[#173c2e]">Book a pickup <ArrowRight size={15} /></Link>
      </section>
      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <InfoCard icon={<Route size={19} />} title="Hub-to-hub route" description="Select your pickup and destination hubs from the hubs currently active in the system." href="/login" linkLabel="Choose a route" />
        <InfoCard icon={<Search size={19} />} title="Public lookup" description="A tracking code gives a quick view of a parcel's progress and recorded timeline." href="/track" linkLabel="Track a parcel" />
        <InfoCard icon={<CreditCard size={19} />} title="Payment status" description="Checkout results are confirmed from the payment record, not just a browser redirect." href="/help#payments" linkLabel="Payment help" />
      </section>
    </MarketingPage>
  );
}
