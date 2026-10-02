"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("Route rendering failed:", error);
  }, [error]);

  return (
    <main className="grid min-h-[70vh] place-items-center px-5">
      <section className="max-w-md rounded-3xl border border-[#e4eae2] bg-white p-8 text-center shadow-lg">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#fff2e8] text-[#b36b36]"><AlertTriangle size={22} /></span>
        <h1 className="mt-5 text-2xl font-semibold tracking-[-.05em]">That didn’t go as planned.</h1>
        <p className="mt-2 text-sm leading-6 text-[#76847a]">Something unexpected interrupted this page. Your account and shipment data have not been changed by this screen.</p>
        <button type="button" onClick={retry} className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-[#176b4d] px-4 text-sm font-bold text-white hover:bg-[#10563d]"><RotateCcw size={15} /> Try again</button>
      </section>
    </main>
  );
}
