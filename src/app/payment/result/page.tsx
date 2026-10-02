"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CircleCheck, CircleHelp, CircleX, LoaderCircle, ArrowRight } from "lucide-react";
import { Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, type Shipment } from "@/lib/api";

function PaymentResultContent() {
  const params = useSearchParams();
  const status = params.get("status");
  const paymentId = params.get("paymentId");
  const confirmed = status === "success";
  const cancelled = status === "cancelled";
  const paymentQuery = useQuery({
    queryKey: ["payment-result", paymentId],
    queryFn: async () => (await apiRequest<{ id: string; status: string; shipment: Shipment }>(`/payments/${paymentId}`)).data,
    enabled: Boolean(paymentId),
    retry: 2,
  });
  const settled = paymentQuery.data?.status === "PAID";
  const Icon = confirmed ? CircleCheck : cancelled ? CircleX : CircleHelp;
  return <main className="grid min-h-screen place-items-center px-4 py-12">
    <section className="w-full max-w-[480px] rounded-[28px] border border-[#e5ebe4] bg-white p-7 text-center shadow-[0_30px_80px_-50px_#2d5039] sm:p-10">
      <span className={`mx-auto grid size-14 place-items-center rounded-2xl ${settled ? "bg-[#e5f3e9] text-[#3d8054]" : cancelled ? "bg-[#fff0ed] text-[#a85146]" : "bg-[#edf2e9] text-[#61806a]"}`}>{paymentQuery.isLoading ? <LoaderCircle className="animate-spin" size={25} /> : <Icon size={25} />}</span>
      <p className="mt-5 text-[10px] font-extrabold uppercase tracking-[.16em] text-[#669074]">bKash checkout</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-[-.06em]">{settled ? "Payment confirmed." : cancelled ? "Checkout cancelled." : confirmed ? "Checking your payment…" : "Payment status unavailable."}</h1>
      <p className="mt-3 text-sm leading-6 text-[#77857b]">{settled ? `Payment for ${paymentQuery.data?.shipment.trackingCode} has been verified. Your receipt is in shipment details.` : cancelled ? "No payment was completed. You can return to your shipment and try bKash checkout again." : confirmed ? "The bKash callback is being checked against the payment record. This screen only confirms a payment once the API marks it paid." : "Open your shipment to confirm the latest payment status."}</p>
      {paymentQuery.isError ? <p role="alert" className="mt-4 rounded-xl bg-[#fff5f2] p-3 text-left text-xs font-semibold text-[#a5463b]">{paymentQuery.error.message}</p> : null}
      {paymentQuery.isSuccess && !settled ? <p className="mt-4 rounded-xl bg-[#fffaf1] p-3 text-left text-xs font-semibold text-[#866a3a]">Payment status: {paymentQuery.data.status}. Refresh this page in a moment if checkout just finished.</p> : null}
      {paymentQuery.data?.shipment.id ? <Link href={`/dashboard/shipments/${encodeURIComponent(paymentQuery.data.shipment.id)}`} className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#176b4d] px-5 text-xs font-extrabold text-white transition hover:bg-[#10563d]">View shipment <ArrowRight size={15} /></Link> : <Link href="/dashboard?tab=shipments" className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#176b4d] px-5 text-xs font-extrabold text-white">My shipments <ArrowRight size={15} /></Link>}
    </section>
  </main>;
}

export default function PaymentResultPage() {
  return <Suspense fallback={<main className="grid min-h-screen place-items-center"><LoaderCircle className="animate-spin text-[#176b4d]" /></main>}><PaymentResultContent /></Suspense>;
}
