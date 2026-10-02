export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-10" aria-label="Loading page">
      <div className="skeleton h-8 w-44 rounded-lg" />
      <div className="mt-10 grid gap-5 sm:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="rounded-2xl border border-[#e5ebe4] bg-white p-5">
            <div className="skeleton h-4 w-24 rounded" />
            <div className="skeleton mt-5 h-9 w-32 rounded" />
            <div className="skeleton mt-4 h-3 w-40 rounded" />
          </div>
        ))}
      </div>
      <div className="skeleton mt-7 h-64 rounded-2xl" />
    </main>
  );
}
