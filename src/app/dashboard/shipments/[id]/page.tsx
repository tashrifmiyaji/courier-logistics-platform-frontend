import type { Metadata } from "next";
import { ShipmentDetails } from "./shipment-details";

export const metadata: Metadata = { title: "Shipment details" };

export default async function ShipmentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ShipmentDetails shipmentId={id} />;
}
