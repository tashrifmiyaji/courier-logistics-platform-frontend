import type { Metadata } from "next";
import { NewShipmentForm } from "./new-shipment-form";

export const metadata: Metadata = { title: "Book a shipment" };

export default function NewShipmentPage() {
  return <NewShipmentForm />;
}
