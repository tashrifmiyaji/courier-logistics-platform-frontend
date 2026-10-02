"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Box, Check, CircleDashed, MapPin, PackageCheck, Search, Truck } from "lucide-react";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest, formatStatus, type ShipmentStatus } from "@/lib/api";

const trackingSchema = z.object({
  trackingCode: z.string().trim().min(4, "Enter the tracking code from your confirmation.").transform((code) => code.toUpperCase()),
});
type TrackingData = {
  trackingCode: string;
  status: ShipmentStatus;
  senderName: string;
  receiverName: string;
  createdAt: string;
  deliveredAt?: string | null;
  trackingEvents: {
    status: ShipmentStatus;
    note?: string | null;
    location?: string | null;
    createdAt: string;
  }[];
};
type TrackingValues = z.infer<typeof trackingSchema>;
const steps: ShipmentStatus[] = ["PENDING", "PICKUP_SCHEDULED", "PICKED_UP", "AT_ORIGIN_HUB", "IN_TRANSIT", "AT_DESTINATION_HUB", "OUT_FOR_DELIVERY", "DELIVERED"];

function TrackingView() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get("code") || "";
  const [result, setResult] = useState<TrackingData | null>(null);
  const [notFound, setNotFound] = useState("");
  const form = useForm<TrackingValues>({ resolver: zodResolver(trackingSchema), defaultValues: { trackingCode: initialCode } });
  const { reset, handleSubmit } = form;
  const mutation = useMutation({
    mutationFn: async (values: TrackingValues) => {
      const response = await apiRequest<TrackingData>(`/shipments/track/${encodeURIComponent(values.trackingCode)}`);
      return response.data;
    },
    onSuccess: (data) => { setResult(data); setNotFound(""); },
    onError: (error) => { setResult(null); setNotFound(error instanceof Error ? error.message : "Tracking lookup failed."); },
  });
  useEffect(() => {
    if (initialCode) {
      reset({ trackingCode: initialCode });
      void handleSubmit((values) => mutation.mutate(values))();
    }
  }, [handleSubmit, initialCode, mutation.mutate, reset]);
  const currentStep = result ? steps.indexOf(result.status) : -1;

  return (
    <main className="min-h-screen px-4 py-7 sm:px-8">
      <div className="mx-auto max-w-[980px]">
        <header className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 text-[17px] font-extrabold tracking-[-.06em]"><span className="grid size-9 place-items-center rounded-xl bg-[#176b4d] text-white"><Box size={18} /></span> parcel<span className="-ml-2 text-[#176b4d]">pilot</span></Link>
          <Link href="/login" className="rounded-xl border border-[#dfe6de] bg-white px-4 py-2.5 text-xs font-extrabold text-[#3b4b41] transition hover:border-[#aac8b3]">My account <ArrowRight size={14} className="ml-1 inline" /></Link>
        </header>
        <div className="mx-auto mt-16 max-w-[660px] text-center sm:mt-20">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#e2f1e7] text-[#176b4d]"><MapPin size={22} /></span>
          <p className="mt-5 text-[10px] font-extrabold uppercase tracking-[.18em] text-[#56876a]">A little parcel update</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-[-.065em] sm:text-5xl">Where’s it now?</h1>
          <p className="mx-auto mt-3 max-w-[430px] text-sm leading-6 text-[#77857b]">Enter the tracking code from your booking confirmation and see its journey so far.</p>
          <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="mt-8 flex flex-col gap-2 rounded-2xl border border-[#e1e8df] bg-white p-2 shadow-[0_18px_55px_-35px_#345840] sm:flex-row">
            <label className="flex min-h-12 flex-1 items-center gap-3 px-3 text-[#87938b]"><Search size={18} /><span className="sr-only">Tracking code</span><input {...form.register("trackingCode")} placeholder="e.g. CLP-M4ABCD-12345" className="min-w-0 flex-1 bg-transparent text-sm font-semibold uppercase tracking-wide text-[#25382d] outline-none placeholder:normal-case placeholder:tracking-normal placeholder:text-[#a6b0a8]" /></label>
            <button type="submit" disabled={mutation.isPending} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#176b4d] px-5 text-sm font-extrabold text-white transition hover:bg-[#10563d] disabled:opacity-60">{mutation.isPending ? <CircleDashed size={16} className="animate-spin" /> : "Track parcel"}{!mutation.isPending ? <ArrowRight size={16} /> : null}</button>
          </form>
          {form.formState.errors.trackingCode?.message ? <p role="alert" className="mt-2 text-left text-xs font-medium text-[#b4473f]">{form.formState.errors.trackingCode.message}</p> : null}
          {notFound ? <p role="alert" className="mt-3 rounded-xl border border-[#f1d5d1] bg-[#fff5f3] p-3 text-left text-xs font-semibold text-[#a54037]">{notFound}</p> : null}
        </div>

        {result ? (
          <section aria-live="polite" className="mx-auto mt-10 max-w-[750px] rounded-[26px] border border-[#e2e9e1] bg-white p-5 shadow-[0_25px_70px_-48px_#294d36] sm:p-8">
            <div className="flex flex-col justify-between gap-4 border-b border-[#edf0eb] pb-5 sm:flex-row sm:items-start">
              <div><p className="text-[10px] font-extrabold uppercase tracking-[.14em] text-[#8b988f]">Tracking code</p><p className="mt-1 font-mono text-lg font-bold tracking-wide">{result.trackingCode}</p></div>
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#e9f5ed] px-3 py-1.5 text-xs font-extrabold text-[#3c8057]"><span className="size-2 rounded-full bg-[#58a475]" />{formatStatus(result.status)}</span>
            </div>
            <div className="grid gap-4 border-b border-[#edf0eb] py-5 sm:grid-cols-2">
              <div><p className="text-[10px] font-extrabold uppercase tracking-[.12em] text-[#9aa49c]">From</p><p className="mt-1 text-sm font-bold">{result.senderName}</p></div>
              <div><p className="text-[10px] font-extrabold uppercase tracking-[.12em] text-[#9aa49c]">To</p><p className="mt-1 text-sm font-bold">{result.receiverName}</p></div>
            </div>
            {result.status === "CANCELLED" || result.status === "RETURNED" || result.status === "FAILED_DELIVERY" ? (
              <p className="my-5 rounded-xl bg-[#fff5eb] p-3 text-xs font-semibold text-[#946634]">{formatStatus(result.status)}. See the latest update below for more detail.</p>
            ) : (
              <div className="my-7 flex items-start">
                {steps.map((step, index) => {
                  const done = currentStep >= index;
                  return <div key={step} className="relative flex flex-1 flex-col items-center text-center last:flex-none">
                    <span className={`relative z-10 grid size-7 place-items-center rounded-full ${done ? "bg-[#176b4d] text-white" : "bg-[#eef1ed] text-[#9ba69e]"}`}>{done ? <Check size={14} /> : <span className="text-[9px] font-bold">{index + 1}</span>}</span>
                    {index < steps.length - 1 ? <span aria-hidden="true" className={`absolute left-1/2 top-3.5 z-0 h-px w-full ${currentStep > index ? "bg-[#74ad88]" : "bg-[#e8ece7]"}`} /> : null}
                    <span className={`mt-2 hidden max-w-[80px] text-[9px] font-bold leading-3 sm:block ${done ? "text-[#38734c]" : "text-[#9ba69e]"}`}>{formatStatus(step)}</span>
                  </div>;
                })}
              </div>
            )}
            <div className="space-y-0">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-extrabold"><Truck size={16} className="text-[#176b4d]" /> Journey updates</h2>
              {result.trackingEvents.length ? [...result.trackingEvents].reverse().map((event, index) => (
                <div key={`${event.status}-${event.createdAt}`} className="flex gap-3 pb-4 last:pb-0">
                  <div className="flex flex-col items-center"><span className={`mt-1 grid size-7 shrink-0 place-items-center rounded-full ${index === 0 ? "bg-[#e1f2e7] text-[#176b4d]" : "bg-[#f0f3ef] text-[#89968d]"}`}>{index === 0 ? <PackageCheck size={14} /> : <Check size={13} />}</span>{index < result.trackingEvents.length - 1 ? <span className="mt-1 w-px flex-1 bg-[#e8ede8]" /> : null}</div>
                  <div className="min-w-0 flex-1 pb-2"><div className="flex flex-col justify-between gap-1 sm:flex-row"><p className="text-xs font-extrabold">{formatStatus(event.status)}</p><time className="text-[10px] font-medium text-[#8d9990]">{new Date(event.createdAt).toLocaleString()}</time></div><p className="mt-1 text-xs text-[#738177]">{event.note || formatStatus(event.status)}{event.location ? ` · ${event.location}` : ""}</p></div>
                </div>
              )) : <p className="text-xs text-[#839087]">Your parcel journey will appear here as it moves.</p>}
            </div>
          </section>
        ) : null}

        <Link href="/" className="mx-auto mt-8 flex w-fit items-center gap-1.5 text-xs font-bold text-[#819087] transition hover:text-[#176b4d]"><ArrowLeft size={14} /> Back to ParcelPilot</Link>
      </div>
    </main>
  );
}

export default function TrackPage() {
  return <Suspense fallback={<main className="grid min-h-screen place-items-center text-sm text-[#718078]">Loading tracking…</main>}><TrackingView /></Suspense>;
}
