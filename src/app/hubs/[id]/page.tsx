import type { Metadata } from "next";
import { HubDetails } from "@/components/operations/hub-details";

export const metadata: Metadata = { title: "Hub details" };

export default async function HubDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <HubDetails hubId={id} />;
}
