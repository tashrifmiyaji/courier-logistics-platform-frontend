"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Box, Check, Clock3, MapPin, MapPinned, PackageCheck, Waypoints } from "lucide-react";
import { MarketingPage } from "@/components/marketing/marketing-page";
import { useHubs } from "@/features/operations/hooks";

export function HubDetails({ hubId }: { hubId: string }) {
  const hubsQuery = useHubs(false);
  const hub = hubsQuery.data?.find((item) => item.id === hubId);
  const related = hubsQuery.data?.filter((item) => item.id !== hubId && item.zoneId === hub?.zoneId).slice(0, 3) || [];

  return (
    <MarketingPage eyebrow="GOparcel hub profile" title={hub?.name || (hubsQuery.isLoading ? "Loading hub details…" : "Hub details")} description="A public profile with the location, network zone, and current availability for this GOparcel parcel hub.">
      <Link href="/explore" className="inline-flex items-center gap-2 text-xs font-extrabold text-[#39764e]"><ArrowLeft size={14} /> Back to all hubs</Link>
      {hubsQuery.isLoading ? <div className="mt-6 space-y-5"><div className="skeleton h-56 rounded-2xl" /><div className="grid gap-4 sm:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="skeleton h-28 rounded-2xl" />)}</div></div> : null}
      {hubsQuery.isError ? <div role="alert" className="mt-6 rounded-2xl border border-[#efd5cf] bg-white p-5 text-sm text-[#a5463b]">The hub information could not be loaded. {hubsQuery.error.message}<button type="button" onClick={() => void hubsQuery.refetch()} className="ml-2 font-bold underline">Try again</button></div> : null}
      {!hubsQuery.isLoading && !hubsQuery.isError && !hub ? <div role="status" className="mt-6 rounded-2xl border border-[#e3eae2] bg-white p-6"><h2 className="font-extrabold">This hub is not available.</h2><p className="mt-2 text-xs leading-5 text-[#718078]">It may have been removed from the live directory. Browse the current network to see available locations.</p><Link href="/explore" className="mt-4 inline-flex items-center gap-2 text-xs font-extrabold text-[#39764e]">Explore current hubs <ArrowRight size={14} /></Link></div> : null}
      {hub ? <>
        <section className="mt-5 overflow-hidden rounded-2xl border border-[#e3eae2] bg-white">
          <div className="grid min-h-60 bg-[#e8f3eb] lg:grid-cols-[1.1fr_.9fr]">
            <div className="relative grid min-h-60 place-items-center overflow-hidden px-7 py-10">
              <div className="absolute left-[18%] top-[18%] size-36 rounded-full bg-[#d4e9d9] blur-3xl" />
              <div className="absolute bottom-[12%] right-[18%] size-40 rounded-full bg-white/70 blur-3xl" />
              <div className="relative w-full max-w-md rounded-[28px] border border-white/80 bg-white/70 p-5 shadow-[0_18px_50px_-30px_#45654c]">
                <div className="flex items-center justify-between gap-3"><div><p className="text-[9px] font-extrabold uppercase tracking-[.15em] text-[#779081]">GOparcel parcel network</p><h2 className="mt-2 text-xl font-extrabold tracking-[-.04em] text-[#294336]">{hub.city}</h2></div><span className="grid size-12 place-items-center rounded-2xl bg-[#176b4d] text-white"><MapPinned size={22} /></span></div>
                <div className="relative mt-7 flex items-center justify-between gap-3">
                  <div className="absolute left-4 right-4 top-1/2 border-t-2 border-dashed border-[#9bbba1]" />
                  {[{ icon: MapPin, label: "Local area" }, { icon: Box, label: hub.code }, { icon: Waypoints, label: "Network" }].map(({ icon: Icon, label }) => <div key={label} className="relative grid justify-items-center gap-2"><span className="grid size-9 place-items-center rounded-full border-4 border-white bg-[#e3f0e5] text-[#32734b]"><Icon size={14} /></span><span className="rounded-md bg-white/90 px-2 py-1 text-[9px] font-bold text-[#596b5e]">{label}</span></div>)}
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-center p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-[#e9f4eb] px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-wide text-[#39764e]">{hub.zone?.name || "GOparcel network"}</span><span className={`rounded-full px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-wide ${hub.isActive ? "bg-[#e9f4eb] text-[#39764e]" : "bg-[#f3f2ee] text-[#7e827d]"}`}>{hub.isActive ? "Currently active" : "Currently inactive"}</span></div>
              <h2 className="mt-5 text-2xl font-extrabold tracking-[-.05em]">{hub.name}</h2>
              <p className="mt-2 font-mono text-[11px] font-bold tracking-wider text-[#77867c]">HUB CODE · {hub.code}</p>
              <p className="mt-5 flex items-start gap-2.5 text-sm leading-6 text-[#68796e]"><MapPin size={17} className="mt-1 shrink-0 text-[#548568]" /><span>{hub.address}<br />{hub.city}</span></p>
              {hub.isActive ? <Link href="/login" className="mt-6 inline-flex h-11 w-fit items-center gap-2 rounded-xl bg-[#176b4d] px-4 text-xs font-extrabold text-white transition hover:bg-[#10563d]">Book a delivery <ArrowRight size={14} /></Link> : <p className="mt-5 rounded-xl bg-[#f4f3ef] p-3 text-xs leading-5 text-[#737a73]">This location is not currently available for new shipment bookings.</p>}
            </div>
          </div>
        </section>
        <section className="mt-6 grid gap-4 sm:grid-cols-3" aria-label="Hub information">
          <article className="rounded-2xl border border-[#e3eae2] bg-white p-5"><span className="grid size-10 place-items-center rounded-xl bg-[#e8f3eb] text-[#176b4d]"><MapPin size={18} /></span><h3 className="mt-4 text-sm font-extrabold">Location</h3><p className="mt-2 text-xs leading-5 text-[#718078]">{hub.address}, {hub.city}</p></article>
          <article className="rounded-2xl border border-[#e3eae2] bg-white p-5"><span className="grid size-10 place-items-center rounded-xl bg-[#e8f3eb] text-[#176b4d]"><Waypoints size={18} /></span><h3 className="mt-4 text-sm font-extrabold">Network zone</h3><p className="mt-2 text-xs leading-5 text-[#718078]">{hub.zone?.name || "This hub is not assigned to a named zone."}</p></article>
          <article className="rounded-2xl border border-[#e3eae2] bg-white p-5"><span className="grid size-10 place-items-center rounded-xl bg-[#e8f3eb] text-[#176b4d]">{hub.isActive ? <Check size={18} /> : <Clock3 size={18} />}</span><h3 className="mt-4 text-sm font-extrabold">Operating status</h3><p className="mt-2 text-xs leading-5 text-[#718078]">{hub.isActive ? "Active in the current courier network and available for new bookings." : "Inactive in the current courier network."}</p></article>
        </section>
        <section className="mt-7 rounded-2xl border border-[#e3eae2] bg-white p-5 sm:p-6">
          <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#e8f3eb] text-[#176b4d]"><PackageCheck size={18} /></span><div><h2 className="text-base font-extrabold">About this location</h2><p className="mt-1 text-xs text-[#718078]">A verified point in the GOparcel service network.</p></div></div>
          <p className="mt-4 max-w-3xl text-xs leading-6 text-[#718078]">{hub.name} serves parcels in {hub.city}{hub.zone?.name ? ` as part of the ${hub.zone.name} zone` : ""}. Its current active status and address are provided by the live logistics network. Route prices and service availability are confirmed during shipment booking.</p>
        </section>
        {related.length ? <section className="mt-8"><div className="mb-4 flex items-end justify-between gap-3"><div><h2 className="text-lg font-extrabold tracking-[-.04em]">More hubs in this zone</h2><p className="mt-1 text-xs text-[#718078]">Other locations from the same live network zone.</p></div><Link href="/explore" className="shrink-0 text-[10px] font-extrabold text-[#39764e]">All hubs →</Link></div><div className="grid gap-3 sm:grid-cols-3">{related.map((item) => <Link key={item.id} href={`/hubs/${encodeURIComponent(item.id)}`} className="rounded-2xl border border-[#e3eae2] bg-white p-4 transition hover:border-[#b8d1be]"><p className="text-sm font-extrabold">{item.name}</p><p className="mt-1 text-[10px] text-[#718078]">{item.city} · {item.code}</p></Link>)}</div></section> : null}
      </> : null}
    </MarketingPage>
  );
}
