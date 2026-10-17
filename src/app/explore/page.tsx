"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDownUp, ArrowRight, MapPin, Search, SlidersHorizontal, Waypoints } from "lucide-react";
import { MarketingPage } from "@/components/marketing/marketing-page";
import { useHubs } from "@/features/operations/hooks";

const pageSize = 8;

function HubArtwork({ name }: { name: string }) {
  const colorIndex = Array.from(name).reduce((sum, letter) => sum + letter.charCodeAt(0), 0) % 3;
  const palettes = [
    { bg: "#e8f3eb", line: "#9ac4a6", pin: "#176b4d", accent: "#cee5d4" },
    { bg: "#edf2e8", line: "#b2c59d", pin: "#517b45", accent: "#dce8cf" },
    { bg: "#e8f1f0", line: "#9bbfba", pin: "#397b70", accent: "#d0e5df" },
  ];
  const palette = palettes[colorIndex];
  return (
    <svg viewBox="0 0 640 280" role="img" aria-label={`Illustration of the GOparcel network near ${name}`} className="h-full w-full">
      <rect width="640" height="280" fill={palette.bg} />
      <path d="M0 195c91-30 135 19 222-4 96-26 127-101 215-80 69 17 121 51 203 12v157H0Z" fill={palette.accent} />
      <path d="M31 225c103-102 159-6 260-88s154 5 312-94" fill="none" stroke="white" strokeWidth="20" strokeLinecap="round" />
      <path d="M31 225c103-102 159-6 260-88s154 5 312-94" fill="none" stroke={palette.line} strokeWidth="3" strokeDasharray="8 10" strokeLinecap="round" />
      <circle cx="291" cy="137" r="35" fill="white" fillOpacity=".72" />
      <circle cx="291" cy="137" r="22" fill={palette.pin} />
      <path d="M291 150s12-13 12-22a12 12 0 1 0-24 0c0 9 12 22 12 22Zm0-18a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z" fill="white" />
      <circle cx="31" cy="225" r="8" fill={palette.pin} stroke="white" strokeWidth="5" />
      <circle cx="603" cy="43" r="8" fill="#d98c55" stroke="white" strokeWidth="5" />
      <rect x="31" y="34" width="176" height="48" rx="14" fill="white" fillOpacity=".9" />
      <path d="M52 52a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm0 4a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z" fill={palette.pin} />
      <text x="69" y="63" fill="#40564a" fontSize="13" fontFamily="Arial,sans-serif" fontWeight="700">LOCAL PARCEL NETWORK</text>
    </svg>
  );
}

function HubCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#e3eae2] bg-white">
      <div className="skeleton h-40" />
      <div className="space-y-3 p-5"><div className="skeleton h-3 w-20 rounded" /><div className="skeleton h-5 w-3/4 rounded" /><div className="skeleton h-3 w-full rounded" /><div className="skeleton mt-5 h-9 w-28 rounded-lg" /></div>
    </div>
  );
}

export default function ExplorePage() {
  const hubsQuery = useHubs(false);
  const hubs = hubsQuery.data || [];
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [zone, setZone] = useState("");
  const [status, setStatus] = useState("active");
  const [sort, setSort] = useState("name");
  const [page, setPage] = useState(1);

  const cities = useMemo(() => [...new Set(hubs.map((hub) => hub.city))].sort(), [hubs]);
  const zones = useMemo(() => [...new Set(hubs.map((hub) => hub.zone?.name).filter((name): name is string => Boolean(name)))].sort(), [hubs]);
  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return hubs.filter((hub) => {
      const matchesSearch = !query || [hub.name, hub.code, hub.city, hub.address, hub.zone?.name].some((value) => value?.toLocaleLowerCase().includes(query));
      const matchesCity = !city || hub.city === city;
      const matchesZone = !zone || hub.zone?.name === zone;
      const matchesStatus = status === "all" || (status === "active" ? hub.isActive : !hub.isActive);
      return matchesSearch && matchesCity && matchesZone && matchesStatus;
    }).sort((a, b) => sort === "city" ? a.city.localeCompare(b.city) || a.name.localeCompare(b.name) : sort === "zone" ? (a.zone?.name || "").localeCompare(b.zone?.name || "") || a.name.localeCompare(b.name) : a.name.localeCompare(b.name));
  }, [city, hubs, search, sort, status, zone]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  const updateFilter = (update: () => void) => {
    update();
    setPage(1);
  };

  return (
    <MarketingPage eyebrow="Explore the network" title="Find your nearest parcel hub." description="Browse real GOparcel service locations, compare cities and zones, and open a hub profile for its address and current status.">
      <section aria-label="Search and filter hubs" className="rounded-2xl border border-[#e3eae2] bg-white p-4 sm:p-5">
        <div className="grid gap-3 md:grid-cols-[minmax(220px,1fr)_repeat(3,minmax(130px,.55fr))]">
          <label className="flex h-11 items-center gap-2 rounded-xl border border-[#dfe6de] px-3 text-[#829087]"><Search size={15} /><span className="sr-only">Search hubs</span><input value={search} onChange={(event) => updateFilter(() => setSearch(event.target.value))} placeholder="Search hub, address, or code" className="min-w-0 flex-1 bg-transparent text-xs text-[#35463b] outline-none placeholder:text-[#99a59c]" /></label>
          <label className="sr-only" htmlFor="hub-city-filter">Filter by city</label><select id="hub-city-filter" value={city} onChange={(event) => updateFilter(() => setCity(event.target.value))} className="h-11 rounded-xl border border-[#dfe6de] bg-white px-3 text-xs font-bold text-[#607066]"><option value="">All cities</option>{cities.map((item) => <option key={item} value={item}>{item}</option>)}</select>
          <label className="sr-only" htmlFor="hub-zone-filter">Filter by zone</label><select id="hub-zone-filter" value={zone} onChange={(event) => updateFilter(() => setZone(event.target.value))} className="h-11 rounded-xl border border-[#dfe6de] bg-white px-3 text-xs font-bold text-[#607066]"><option value="">All zones</option>{zones.map((item) => <option key={item} value={item}>{item}</option>)}</select>
          <label className="sr-only" htmlFor="hub-status-filter">Filter by status</label><select id="hub-status-filter" value={status} onChange={(event) => updateFilter(() => setStatus(event.target.value))} className="h-11 rounded-xl border border-[#dfe6de] bg-white px-3 text-xs font-bold text-[#607066]"><option value="active">Active hubs</option><option value="inactive">Inactive hubs</option><option value="all">All status</option></select>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#edf0eb] pt-3">
          <p className="flex items-center gap-1.5 text-[10px] font-semibold text-[#829087]"><SlidersHorizontal size={13} />{hubsQuery.isLoading ? "Loading live network…" : `${filtered.length} ${filtered.length === 1 ? "hub" : "hubs"} found`}</p>
          <label className="flex items-center gap-2 text-[10px] font-bold text-[#829087]"><ArrowDownUp size={13} />Sort by<select aria-label="Sort hubs" value={sort} onChange={(event) => updateFilter(() => setSort(event.target.value))} className="rounded-lg border border-[#e0e7df] bg-white px-2.5 py-2 text-[10px] font-bold text-[#516257]"><option value="name">Hub name</option><option value="city">City</option><option value="zone">Zone</option></select></label>
        </div>
      </section>

      {hubsQuery.isError ? <div role="alert" className="mt-5 rounded-2xl border border-[#efd5cf] bg-white p-5 text-sm text-[#a5463b]">The live hub directory could not be loaded. {hubsQuery.error.message}<button type="button" onClick={() => void hubsQuery.refetch()} className="ml-2 font-bold underline">Try again</button></div> : null}
      {hubsQuery.isLoading ? <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 8 }, (_, index) => <HubCardSkeleton key={index} />)}</div> : null}
      {!hubsQuery.isLoading && !hubsQuery.isError && visible.length ? <div className="mt-6 grid auto-rows-fr gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {visible.map((hub) => <article key={hub.id} className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#e3eae2] bg-white transition hover:-translate-y-0.5 hover:shadow-[0_20px_45px_-30px_#294b35]">
          <div className="h-40 overflow-hidden"><HubArtwork name={hub.name} /></div>
          <div className="flex flex-1 flex-col p-5">
            <div className="flex items-center justify-between gap-2"><span className="rounded-full bg-[#e9f4eb] px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wide text-[#39764e]">{hub.zone?.name || "GOparcel network"}</span><span className={`rounded-full px-2.5 py-1 text-[9px] font-extrabold ${hub.isActive ? "bg-[#e9f4eb] text-[#39764e]" : "bg-[#f3f2ee] text-[#7e827d]"}`}>{hub.isActive ? "Open" : "Inactive"}</span></div>
            <h2 className="mt-4 line-clamp-1 text-base font-extrabold tracking-[-.03em]">{hub.name}</h2>
            <p className="mt-1 font-mono text-[9px] font-bold tracking-wide text-[#7f8d83]">{hub.code}</p>
            <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-[#718078]"><MapPin size={14} className="mt-0.5 shrink-0 text-[#548568]" /><span className="line-clamp-2">{hub.address}, {hub.city}</span></p>
            <Link href={`/hubs/${encodeURIComponent(hub.id)}`} className="mt-auto inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#dce7dc] bg-[#f7faf6] px-3 text-[11px] font-extrabold text-[#316d48] transition hover:border-[#b4d0b9] hover:bg-[#edf5ed]">
              View details <ArrowRight size={14} />
            </Link>
          </div>
        </article>)}
      </div> : null}
      {!hubsQuery.isLoading && !hubsQuery.isError && !visible.length ? <div className="mt-6 grid min-h-56 place-items-center rounded-2xl border border-dashed border-[#d9e3d9] bg-white px-5 text-center"><div><Waypoints size={25} className="mx-auto text-[#759581]" /><h2 className="mt-3 text-sm font-extrabold">No hubs match those filters</h2><p className="mt-1 text-xs text-[#829087]">Try a different city, zone, status, or search term.</p><button type="button" onClick={() => { setSearch(""); setCity(""); setZone(""); setStatus("active"); setPage(1); }} className="mt-3 text-xs font-bold text-[#35734d] underline">Reset filters</button></div></div> : null}
      {!hubsQuery.isLoading && pageCount > 1 ? <nav aria-label="Hub directory pages" className="mt-6 flex items-center justify-between border-t border-[#e5ebe4] pt-4 text-[10px] font-semibold text-[#829087]"><span>Page {page} of {pageCount}</span><div className="flex gap-2"><button type="button" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="rounded-lg border border-[#dfe6de] bg-white px-3 py-2 disabled:opacity-40">Previous</button><button type="button" disabled={page === pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))} className="rounded-lg border border-[#dfe6de] bg-white px-3 py-2 disabled:opacity-40">Next</button></div></nav> : null}
      <p className="mt-7 text-[10px] leading-5 text-[#859188]">Hub names, addresses, zones, and operational status are supplied by the live GOparcel network. Illustrations are decorative and do not represent exact street maps.</p>
    </MarketingPage>
  );
}
