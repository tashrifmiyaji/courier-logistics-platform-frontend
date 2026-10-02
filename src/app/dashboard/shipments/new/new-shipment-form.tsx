"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Box, Check, CircleDashed, MapPin, Package, Scale } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest, money } from "@/lib/api";

const shipmentSchema = z.object({
  senderName: z.string().trim().min(2, "Enter the sender’s name.").max(100),
  senderPhone: z.string().trim().min(8, "Enter a valid phone number.").max(20),
  pickupAddress: z.string().trim().min(5, "Enter a complete pickup address."),
  pickupHubId: z.string().uuid("Choose a pickup hub."),
  receiverName: z.string().trim().min(2, "Enter the recipient’s name.").max(100),
  receiverPhone: z.string().trim().min(8, "Enter a valid phone number.").max(20),
  deliveryAddress: z.string().trim().min(5, "Enter a complete delivery address."),
  deliveryHubId: z.string().uuid("Choose a delivery hub."),
  weightKg: z.coerce.number().positive("Weight must be above zero.").max(999),
  parcelType: z.string().trim().max(100).optional(),
  codAmount: z.union([z.literal(""), z.coerce.number().nonnegative()]).optional(),
  scheduledPickupAt: z.string().optional().refine(
    (value) => !value || new Date(value).getTime() > Date.now(),
    "Choose a pickup time in the future.",
  ),
}).refine((values) => values.pickupHubId !== values.deliveryHubId, {
  path: ["deliveryHubId"],
  message: "Choose a different delivery hub.",
});

type ShipmentInput = z.input<typeof shipmentSchema>;
type ShipmentValues = z.output<typeof shipmentSchema>;
type Hub = { id: string; name: string; code: string; city: string; address: string; zoneId: string };
type Quote = { deliveryCharge: number; baseFare: number; perKgRate: number; weightKg: number };

const fieldClass = "mt-1.5 h-11 w-full rounded-xl border border-[#dfe6de] bg-white px-3.5 text-sm text-[#26382e] outline-none transition placeholder:text-[#a4aea6] focus:border-[#70a888] focus:ring-4 focus:ring-[#176b4d]/[.07]";

export function NewShipmentForm() {
  const router = useRouter();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quotedFor, setQuotedFor] = useState("");
  const [error, setError] = useState("");
  const hubsQuery = useQuery({
    queryKey: ["active-hubs"],
    queryFn: async () => (await apiRequest<Hub[]>("/operations/hubs?active=true")).data,
  });
  const form = useForm<ShipmentInput, unknown, ShipmentValues>({
    resolver: zodResolver(shipmentSchema),
    defaultValues: { weightKg: 1, codAmount: "", scheduledPickupAt: "" },
  });
  const createShipment = useMutation({
    mutationFn: async (values: ShipmentValues) => {
      const response = await apiRequest<{ id: string; trackingCode: string }>("/shipments", {
        method: "POST",
        body: JSON.stringify({
          ...values,
          codAmount: values.codAmount === "" ? undefined : Number(values.codAmount),
          scheduledPickupAt: values.scheduledPickupAt || undefined,
        }),
      });
      return response.data;
    },
    onSuccess: (shipment) => router.replace(`/dashboard/shipments/${shipment.id}?created=${shipment.trackingCode}`),
    onError: (cause) => setError(cause instanceof Error ? cause.message : "Your shipment could not be created."),
  });
  const calculatePrice = useMutation({
    mutationFn: async (values: ShipmentValues) => (await apiRequest<Quote>("/operations/pricing/calculate", {
      method: "POST",
      body: JSON.stringify({ fromHubId: values.pickupHubId, toHubId: values.deliveryHubId, weightKg: values.weightKg }),
    })).data,
    onMutate: () => {
      setQuote(null);
      setQuotedFor("");
    },
    onSuccess: (data, values) => {
      setQuote(data);
      setQuotedFor(`${values.pickupHubId}:${values.deliveryHubId}:${values.weightKg}`);
      setError("");
    },
    onError: (cause) => setError(cause instanceof Error ? cause.message : "A route quote could not be calculated."),
  });
  const watchHubFrom = form.watch("pickupHubId");
  const watchHubTo = form.watch("deliveryHubId");
  const watchWeight = form.watch("weightKg");
  const quoteIsCurrent =
    Boolean(quote) &&
    quotedFor === `${watchHubFrom}:${watchHubTo}:${watchWeight}`;

  return (
    <main className="mx-auto max-w-[1080px] px-4 pb-14 pt-7 sm:px-7 sm:pt-10">
      <Link href="/dashboard?tab=shipments" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#77857b] transition hover:text-[#176b4d]"><ArrowLeft size={14} /> Back to my shipments</Link>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_330px] lg:items-start">
        <section className="rounded-[24px] border border-[#e5ebe4] bg-white p-5 shadow-[0_25px_70px_-55px_#2f573b] sm:p-7">
          <div className="mb-7 flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-[#e6f2e9] text-[#36734d]"><Package size={21} /></span><div><p className="text-[10px] font-extrabold uppercase tracking-[.14em] text-[#5d8b6e]">New booking</p><h1 className="mt-0.5 text-2xl font-semibold tracking-[-.06em]">Where should we take it?</h1></div></div>
          {error ? <p role="alert" className="mb-5 rounded-xl border border-[#f0d2cb] bg-[#fff5f2] px-4 py-3 text-xs font-semibold text-[#a5463b]">{error}</p> : null}
          {hubsQuery.isLoading ? <div className="skeleton h-20 rounded-xl" /> : hubsQuery.isError ? <p role="alert" className="rounded-xl bg-[#fff5f2] p-4 text-xs font-semibold text-[#a5463b]">{hubsQuery.error.message}</p> : hubsQuery.data?.length ? (
            <form onSubmit={form.handleSubmit((values) => { setError(""); createShipment.mutate(values); })} className="space-y-7" noValidate>
              <fieldset className="space-y-4">
                <legend className="mb-4 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[.1em] text-[#526259]"><span className="grid size-6 place-items-center rounded-lg bg-[#edf4ed] text-[#538267]"><ArrowUpRightIcon /></span> Pickup details</legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-[10px] font-bold text-[#66756b]">Sender’s name<input {...form.register("senderName")} autoComplete="name" placeholder="Full name" className={fieldClass} /><FieldError>{form.formState.errors.senderName?.message}</FieldError></label>
                  <label className="text-[10px] font-bold text-[#66756b]">Sender’s phone<input {...form.register("senderPhone")} type="tel" autoComplete="tel" placeholder="+880 1XXX XXXXXX" className={fieldClass} /><FieldError>{form.formState.errors.senderPhone?.message}</FieldError></label>
                  <label className="text-[10px] font-bold text-[#66756b] sm:col-span-2">Pickup address<textarea {...form.register("pickupAddress")} rows={2} placeholder="House, road, area, and any helpful directions" className="mt-1.5 w-full rounded-xl border border-[#dfe6de] bg-white px-3.5 py-3 text-sm outline-none transition placeholder:text-[#a4aea6] focus:border-[#70a888] focus:ring-4 focus:ring-[#176b4d]/[.07]" /><FieldError>{form.formState.errors.pickupAddress?.message}</FieldError></label>
                  <label className="text-[10px] font-bold text-[#66756b] sm:col-span-2">Pickup hub<select {...form.register("pickupHubId")} className={fieldClass}><option value="">Select a pickup hub</option>{hubsQuery.data.map((hub) => <option key={hub.id} value={hub.id}>{hub.name} · {hub.city}</option>)}</select><FieldError>{form.formState.errors.pickupHubId?.message}</FieldError></label>
                </div>
              </fieldset>

              <fieldset className="space-y-4 border-t border-[#edf0eb] pt-6">
                <legend className="mb-4 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[.1em] text-[#526259]"><span className="grid size-6 place-items-center rounded-lg bg-[#fbf2e7] text-[#a17a45]"><MapPin size={13} /></span> Delivery details</legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-[10px] font-bold text-[#66756b]">Recipient’s name<input {...form.register("receiverName")} placeholder="Full name" className={fieldClass} /><FieldError>{form.formState.errors.receiverName?.message}</FieldError></label>
                  <label className="text-[10px] font-bold text-[#66756b]">Recipient’s phone<input {...form.register("receiverPhone")} type="tel" placeholder="+880 1XXX XXXXXX" className={fieldClass} /><FieldError>{form.formState.errors.receiverPhone?.message}</FieldError></label>
                  <label className="text-[10px] font-bold text-[#66756b] sm:col-span-2">Delivery address<textarea {...form.register("deliveryAddress")} rows={2} placeholder="House, road, area, and any helpful directions" className="mt-1.5 w-full rounded-xl border border-[#dfe6de] bg-white px-3.5 py-3 text-sm outline-none transition placeholder:text-[#a4aea6] focus:border-[#70a888] focus:ring-4 focus:ring-[#176b4d]/[.07]" /><FieldError>{form.formState.errors.deliveryAddress?.message}</FieldError></label>
                  <label className="text-[10px] font-bold text-[#66756b] sm:col-span-2">Destination hub<select {...form.register("deliveryHubId")} className={fieldClass}><option value="">Select a delivery hub</option>{hubsQuery.data.map((hub) => <option key={hub.id} value={hub.id}>{hub.name} · {hub.city}</option>)}</select><FieldError>{form.formState.errors.deliveryHubId?.message}</FieldError></label>
                </div>
              </fieldset>

              <fieldset className="space-y-4 border-t border-[#edf0eb] pt-6">
                <legend className="mb-4 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[.1em] text-[#526259]"><span className="grid size-6 place-items-center rounded-lg bg-[#edf0f8] text-[#6879a1]"><Box size={13} /></span> Parcel information</legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-[10px] font-bold text-[#66756b]">Weight (kg)<span className="relative block"><Scale size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#98a39b]" /><input {...form.register("weightKg")} type="number" step="0.1" min="0.1" max="999" className={`${fieldClass} pl-9`} /></span><FieldError>{form.formState.errors.weightKg?.message}</FieldError></label>
                  <label className="text-[10px] font-bold text-[#66756b]">Parcel type <span className="font-normal text-[#9aa49c]">— optional</span><input {...form.register("parcelType")} maxLength={100} placeholder="Documents, clothing, etc." className={fieldClass} /><FieldError>{form.formState.errors.parcelType?.message}</FieldError></label>
                  <label className="text-[10px] font-bold text-[#66756b]">Cash on delivery <span className="font-normal text-[#9aa49c]">— optional</span><input {...form.register("codAmount")} type="number" min="0" step="1" placeholder="Amount in BDT" className={fieldClass} /><FieldError>{form.formState.errors.codAmount?.message}</FieldError><span className="mt-1 block text-[9px] font-normal text-[#98a39b]">The delivery charge is separate. COD collection is recorded with the booking.</span></label>
                  <label className="text-[10px] font-bold text-[#66756b]">Schedule pickup <span className="font-normal text-[#9aa49c]">— optional</span><input {...form.register("scheduledPickupAt")} type="datetime-local" className={fieldClass} /><FieldError>{form.formState.errors.scheduledPickupAt?.message}</FieldError><span className="mt-1 block text-[9px] font-normal text-[#98a39b]">Choose a future time or leave empty for the earliest pickup.</span></label>
                </div>
              </fieldset>
              <div className="flex flex-col gap-3 border-t border-[#edf0eb] pt-5 sm:flex-row sm:justify-between">
                <button type="button" disabled={calculatePrice.isPending || !watchHubFrom || !watchHubTo || !watchWeight || watchHubFrom === watchHubTo} onClick={form.handleSubmit((values) => calculatePrice.mutate(values))} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#dfe6de] px-4 text-xs font-extrabold text-[#52645a] transition hover:bg-[#f7f9f5] disabled:opacity-50"><CircleDashed className={calculatePrice.isPending ? "animate-spin" : ""} size={15} />{calculatePrice.isPending ? "Calculating…" : quote ? "Refresh quote" : "Calculate delivery charge"}</button>
                <button type="submit" disabled={createShipment.isPending || !quoteIsCurrent} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#176b4d] px-5 text-xs font-extrabold text-white transition hover:bg-[#10563d] disabled:cursor-not-allowed disabled:opacity-50">{createShipment.isPending ? "Creating booking…" : "Confirm shipment"}{!createShipment.isPending ? <ArrowRight size={15} /> : null}</button>
              </div>
            </form>
          ) : <p className="rounded-xl border border-[#f0ddc8] bg-[#fffaf2] p-4 text-xs font-semibold leading-5 text-[#8c693d]">There are no active delivery hubs yet. Please check back later or contact the operations team.</p>}
        </section>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <section className="rounded-2xl border border-[#e5ebe4] bg-white p-5">
            <div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-[#edf4ed] text-[#568368]"><Scale size={16} /></span><div><h2 className="text-xs font-extrabold">Your delivery charge</h2><p className="mt-1 text-[10px] text-[#89958d]">Calculated by route and weight</p></div></div>
            <div className="mt-5 rounded-xl bg-[#f6f8f4] p-4">
              {quote && quoteIsCurrent ? <><p className="text-[10px] font-bold uppercase tracking-wider text-[#8b988f]">Estimated total</p><p className="mt-1 text-3xl font-semibold tracking-[-.06em] text-[#216642]">{money(quote.deliveryCharge)}</p><div className="mt-4 space-y-2 border-t border-[#e7ece6] pt-3 text-[10px]"><div className="flex justify-between"><span className="text-[#849087]">Base fare</span><span className="font-bold">{money(quote.baseFare)}</span></div><div className="flex justify-between"><span className="text-[#849087]">Weight charge · {quote.weightKg} kg</span><span className="font-bold">{money(quote.perKgRate * quote.weightKg)}</span></div></div></> : <p className="text-xs leading-5 text-[#87948a]">{quote ? "The route or weight changed. Calculate again to refresh the delivery charge." : "Choose your hubs and enter the parcel weight, then calculate your price before booking."}</p>}
            </div>
            <p className="mt-4 flex items-start gap-2 text-[10px] leading-4 text-[#859188]"><Check size={13} className="mt-0.5 shrink-0 text-[#5b9870]" /> The price is confirmed by your delivery route. You can pay securely using bKash once the shipment is created.</p>
          </section>
          <section className="rounded-2xl border border-[#e5ebe4] bg-[#edf4ed] p-5"><h2 className="text-xs font-extrabold text-[#3d664b]">A note on pickup</h2><p className="mt-2 text-[10px] leading-5 text-[#6e8373]">Make sure someone is available at the pickup address. You’ll receive the tracking code as soon as your booking is created.</p><Link href="/track" className="mt-3 inline-flex items-center gap-1 text-[10px] font-extrabold text-[#34744d]">Already have a code? Track it <ArrowRight size={12} /></Link></section>
        </aside>
      </div>
    </main>
  );
}

function FieldError({ children }: { children?: string }) {
  return children ? <span role="alert" className="mt-1 block text-[10px] font-medium text-[#b4473f]">{children}</span> : null;
}

function ArrowUpRightIcon() {
  return <ArrowRight size={13} className="-rotate-45" />;
}
