import type { Shipment } from "@/lib/api";
import apiClient from "@/lib/api-client";

export type PaymentCheckout = { paymentId: string; paymentURL: string };
export type PaymentDetails = { id: string; status: string; shipment: Shipment };

export async function startPayment(shipmentId: string) {
  return (await apiClient<PaymentCheckout>("/payments/initiate", {
    method: "POST",
    body: JSON.stringify({ shipmentId, provider: "BKASH" }),
  })).data;
}

export async function getPayment(id: string) {
  return (await apiClient<PaymentDetails>(
    `/payments/${encodeURIComponent(id)}`,
  )).data;
}
