"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Check, CircleDashed, MapPin, Package, ShieldCheck, Truck } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { apiRequest, formatStatus, money, type Role, type Shipment, type ShipmentStatus } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";

const journey: ShipmentStatus[] = [
  "PENDING",
  "PICKUP_SCHEDULED",
  "PICKED_UP",
  "AT_ORIGIN_HUB",
  "IN_TRANSIT",
  "AT_DESTINATION_HUB",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];
const nextStatus: Partial<Record<ShipmentStatus, ShipmentStatus[]>> = {
  PENDING: ["PICKUP_SCHEDULED"],
  PICKUP_SCHEDULED: ["PICKED_UP"],
  PICKED_UP: ["AT_ORIGIN_HUB"],
  AT_ORIGIN_HUB: ["IN_TRANSIT"],
  IN_TRANSIT: ["AT_DESTINATION_HUB"],
  AT_DESTINATION_HUB: ["OUT_FOR_DELIVERY"],
  OUT_FOR_DELIVERY: ["DELIVERED", "FAILED_DELIVERY"],
  FAILED_DELIVERY: ["RETURNED"],
};

export function ShipmentDetails({ shipmentId }: { shipmentId: string }) {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [error, setError] = useState("");
  const shipmentQuery = useQuery({
    queryKey: ["shipment", shipmentId],
    queryFn: async () => (await apiRequest<Shipment>(`/shipments/${shipmentId}`)).data,
  });
  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: async () => (await apiRequest<typeof user extends null ? never : NonNullable<typeof user>>("/users/me")).data,
  });
  useEffect(() => {
    if (profileQuery.data) setUser(profileQuery.data);
  }, [profileQuery.data, setUser]);
  const role: Role = profileQuery.data?.role || user?.role || "CUSTOMER";
  const shipment = shipmentQuery.data;
  const currentPayment = shipment?.payments?.find((item) => item.status === "PAID") || shipment?.payments?.[0];
  const canPay = role === "CUSTOMER" && !shipment?.payments?.some((item) => item.status === "PAID") && !["CANCELLED", "DELIVERED"].includes(shipment?.status || "");
  const cancel = useMutation({
    mutationFn: () => apiRequest(`/shipments/${shipmentId}/cancel`, { method: "PATCH" }),
    onSuccess: refresh,
    onError: (cause) => setError(cause instanceof Error ? cause.message : "Shipment could not be cancelled."),
  });
  const updateStatus = useMutation({
    mutationFn: (status: ShipmentStatus) => apiRequest(`/shipments/${shipmentId}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
    onSuccess: refresh,
    onError: (cause) => setError(cause instanceof Error ? cause.message : "Shipment status could not be updated."),
  });
  const pay = useMutation({
    mutationFn: async () => (await apiRequest<{ paymentId: string; paymentURL: string }>("/payments/initiate", { method: "POST", body: JSON.stringify({ shipmentId, provider: "BKASH" }) })).data,
    onSuccess: (data) => window.location.assign(data.paymentURL),
    onError: (cause) => setError(cause instanceof Error ? cause.message : "bKash checkout could not be started."),
  });

  function refresh() {
    setError("");
    void queryClient.invalidateQueries({ queryKey: ["shipment", shipmentId] });
    void queryClient.invalidateQueries({ queryKey: ["shipments"] });
  }

  if (shipmentQuery.isLoading || profileQuery.isLoading) {
    return <main className="mx-auto max-w-5xl px-4 py-10"><div className="skeleton h-8 w-48 rounded" /><div className="skeleton mt-6 h-72 rounded-2xl" /></main>;
  }
  if (shipmentQuery.isError || !shipment) {
    return <main className="mx-auto max-w-3xl px-4 py-12"><Link href="/dashboard?tab=shipments" className="inline-flex items-center gap-2 text-xs font-bold text-[#6e7f73]"><ArrowLeft size={14} /> Shipments</Link><p role="alert" className="mt-6 rounded-2xl border border-[#f0d2cb] bg-white p-5 text-sm text-[#a5463b]">{shipmentQuery.error?.message || "Shipment could not be found."}</p></main>;
  }

  const activeIndex = journey.indexOf(shipment.status);
  const createdCode = searchParams.get("created");
  const payment = () => pay.mutate();
  return (
    <main className="mx-auto max-w-[1150px] px-4 pb-12 pt-7 sm:px-7 sm:pt-10">
      <Link href="/dashboard?tab=shipments" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#77857b] transition hover:text-[#176b4d]"><ArrowLeft size={14} /> Back to shipments</Link>
      {createdCode ? <div role="status" className="mt-5 flex items-start gap-3 rounded-2xl border border-[#cae6d3] bg-[#eff9f1] p-4 text-xs font-semibold text-[#36724d]"><Check size={16} className="mt-0.5 shrink-0" /><div><p>Your booking is confirmed.</p><p className="mt-1 font-mono font-extrabold tracking-wide">{createdCode}</p><p className="mt-1 font-normal">Save this tracking code to follow the parcel journey.</p></div></div> : null}
      <div className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_.75fr]">
        <div className="space-y-5">
          <section className="rounded-[24px] border border-[#e5ebe4] bg-white p-5 sm:p-7">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><p className="text-[10px] font-extrabold uppercase tracking-[.15em] text-[#638b6e]">Shipment tracking</p><h1 className="mt-1 font-mono text-2xl font-bold tracking-[-.04em]">{shipment.trackingCode}</h1><p className="mt-2 text-xs text-[#819087]">Booked {new Date(shipment.createdAt).toLocaleString()}</p></div><span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-extrabold ${shipment.status === "DELIVERED" ? "bg-[#eaf5ec] text-[#3c8154]" : "bg-[#f3f2e8] text-[#907a3a]"}`}><span className="size-1.5 rounded-full bg-current" />{formatStatus(shipment.status)}</span></div>
            {["CANCELLED", "RETURNED", "FAILED_DELIVERY"].includes(shipment.status) ? <p className="mt-6 rounded-xl bg-[#fff5ed] p-3 text-xs font-semibold text-[#946634]">This parcel is {formatStatus(shipment.status).toLowerCase()}. See the latest timeline update for details.</p> : (
              <div className="mt-8 grid grid-cols-4 gap-y-5 sm:grid-cols-8">
                {journey.map((step, index) => <div key={step} className="flex flex-col items-center text-center"><span className={`grid size-7 place-items-center rounded-full ${index <= activeIndex ? "bg-[#176b4d] text-white" : "bg-[#edf1eb] text-[#a0aaa2]"}`}>{index < activeIndex ? <Check size={13} /> : <span className="text-[9px] font-bold">{index + 1}</span>}</span><span className={`mt-2 max-w-[74px] text-[8px] font-bold leading-3 ${index <= activeIndex ? "text-[#3f7952]" : "text-[#9aa49c]"}`}>{formatStatus(step)}</span></div>)}
              </div>
            )}
          </section>
          <section className="rounded-[24px] border border-[#e5ebe4] bg-white p-5 sm:p-7"><div className="flex items-center justify-between"><div><h2 className="text-sm font-extrabold">Parcel journey</h2><p className="mt-1 text-[10px] text-[#8c9890]">Every status update recorded so far.</p></div><span className="grid size-9 place-items-center rounded-xl bg-[#edf4ed] text-[#568368]"><ActivityIcon /></span></div>
            <div className="mt-6 space-y-0">
              {shipment.trackingEvents?.length ? [...shipment.trackingEvents].reverse().map((event, index, all) => <div key={`${event.status}-${event.createdAt}`} className="flex gap-3 pb-4 last:pb-0"><div className="flex flex-col items-center"><span className={`mt-1 grid size-7 shrink-0 place-items-center rounded-full ${index === 0 ? "bg-[#e1f2e7] text-[#176b4d]" : "bg-[#f0f3ef] text-[#89968d]"}`}><Check size={13} /></span>{index < all.length - 1 ? <span className="mt-1 w-px flex-1 bg-[#e8ede8]" /> : null}</div><div className="min-w-0 flex-1 pb-2"><div className="flex flex-col justify-between gap-1 sm:flex-row"><p className="text-xs font-extrabold">{formatStatus(event.status)}</p><time className="text-[10px] font-medium text-[#8d9990]">{new Date(event.createdAt).toLocaleString()}</time></div><p className="mt-1 text-xs text-[#738177]">{event.note || formatStatus(event.status)}{event.location ? ` · ${event.location}` : ""}</p></div></div>) : <p className="text-xs text-[#839087]">No tracking events have been recorded yet.</p>}
            </div>
          </section>
        </div>
        <aside className="space-y-5">
          <section className="rounded-[24px] border border-[#e5ebe4] bg-white p-5 sm:p-6"><h2 className="text-sm font-extrabold">Delivery summary</h2><div className="mt-5 flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-[#edf4ed] text-[#568368]"><MapPin size={16} /></span><div className="min-w-0"><p className="text-[9px] font-extrabold uppercase tracking-wider text-[#9aa49c]">Pickup</p><p className="mt-1 truncate text-xs font-bold">{shipment.pickupHub?.name || shipment.pickupAddress}</p><p className="mt-1 truncate text-[10px] text-[#829087]">{shipment.pickupAddress}</p></div></div><div className="ml-[17px] h-6 border-l border-dashed border-[#cbd9ce]" /><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-[#fbf2e7] text-[#9b7845]"><MapPin size={16} /></span><div className="min-w-0"><p className="text-[9px] font-extrabold uppercase tracking-wider text-[#9aa49c]">Delivery</p><p className="mt-1 truncate text-xs font-bold">{shipment.deliveryHub?.name || shipment.deliveryAddress}</p><p className="mt-1 truncate text-[10px] text-[#829087]">{shipment.deliveryAddress}</p></div></div>
            <div className="mt-5 space-y-2.5 border-t border-[#edf0eb] pt-4 text-xs"><div className="flex justify-between"><span className="text-[#849087]">Recipient</span><span className="font-bold">{shipment.receiverName}</span></div><div className="flex justify-between"><span className="text-[#849087]">Courier</span><span className="font-bold">{shipment.courier?.user?.name || "Not assigned yet"}</span></div><div className="flex justify-between"><span className="text-[#849087]">Delivery charge</span><span className="font-extrabold">{money(shipment.deliveryCharge)}</span></div><div className="flex justify-between"><span className="text-[#849087]">Payment</span><span className={`font-extrabold ${currentPayment?.status === "PAID" ? "text-[#3e8154]" : "text-[#a37c3e]"}`}>{currentPayment?.status || "Not started"}</span></div></div>
          </section>
          {error ? <p role="alert" className="rounded-xl border border-[#f0d2cb] bg-[#fff5f2] p-3 text-xs font-semibold text-[#a5463b]">{error}</p> : null}
          {canPay ? <section className="rounded-[24px] border border-[#e7ddc9] bg-[#fffaf1] p-5"><p className="text-xs font-extrabold text-[#735c34]">Ready when you are</p><p className="mt-1 text-[10px] leading-5 text-[#897856]">Pay the delivery charge securely through the bKash checkout.</p><button type="button" onClick={payment} disabled={pay.isPending} className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#176b4d] text-xs font-extrabold text-white transition hover:bg-[#10563d] disabled:opacity-50">{pay.isPending ? <CircleDashed size={14} className="animate-spin" /> : <span className="font-black italic">bKash</span>}{pay.isPending ? "Connecting…" : `Continue · ${money(shipment.deliveryCharge)}`}<ArrowRight size={14} /></button></section> : null}
          {role === "CUSTOMER" && ["PENDING", "PICKUP_SCHEDULED"].includes(shipment.status) ? <ConfirmationDialog trigger={<button type="button" disabled={cancel.isPending} className="h-10 w-full rounded-xl border border-[#ecd8d4] bg-white text-xs font-bold text-[#a34f45] transition hover:bg-[#fff6f4] disabled:opacity-50">{cancel.isPending ? "Cancelling…" : "Cancel shipment"}</button>} title="Cancel this shipment?" description="This booking can only be cancelled before pickup. The status change cannot be undone." confirmLabel="Cancel shipment" destructive onConfirm={() => cancel.mutate()} /> : null}
          {(role === "ADMIN" || role === "COURIER") && nextStatus[shipment.status]?.length ? <section className="rounded-[24px] border border-[#e5ebe4] bg-white p-5"><h2 className="flex items-center gap-2 text-xs font-extrabold"><Truck size={15} className="text-[#568368]" />Update shipment status</h2><p className="mt-1.5 text-[10px] leading-4 text-[#849087]">The API enforces the allowed next status for this parcel.</p><div className="mt-3 space-y-2">{nextStatus[shipment.status]?.map((status) => <button key={status} type="button" disabled={updateStatus.isPending} onClick={() => updateStatus.mutate(status)} className="flex h-9 w-full items-center justify-between rounded-lg bg-[#edf5ee] px-3 text-[10px] font-extrabold text-[#36734d] transition hover:bg-[#e0eee3] disabled:opacity-50">{formatStatus(status)} <ArrowRight size={13} /></button>)}</div></section> : null}
          {role === "COURIER" ? <div className="flex items-start gap-2 rounded-xl border border-[#e5ebe4] bg-white p-3 text-[10px] leading-4 text-[#7f8c82]"><ShieldCheck size={14} className="mt-0.5 shrink-0 text-[#679778]" />Only the assigned courier and an administrator can update this shipment.</div> : null}
          <Link href={`/track?code=${encodeURIComponent(shipment.trackingCode)}`} className="flex items-center justify-between rounded-xl border border-[#e5ebe4] bg-white px-4 py-3 text-xs font-bold text-[#53665a] transition hover:border-[#bbd2c0]">Open public tracking page <ArrowRight size={14} /></Link>
        </aside>
      </div>
    </main>
  );
}

function ActivityIcon() {
  return <Package size={16} />;
}
