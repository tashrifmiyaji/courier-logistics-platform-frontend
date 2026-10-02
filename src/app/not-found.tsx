import Link from "next/link";
import { ArrowLeft, PackageX } from "lucide-react";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-5">
      <section className="text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#e5f2e8] text-[#176b4d]"><PackageX size={25} /></span>
        <p className="mt-5 text-xs font-extrabold uppercase tracking-[.16em] text-[#59866a]">404 · Route not found</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-[-.06em]">This route took a wrong turn.</h1>
        <Link href="/" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#176b4d] px-4 py-3 text-sm font-bold text-white"><ArrowLeft size={15} /> Back to home</Link>
      </section>
    </main>
  );
}
